#!/usr/bin/env php
<?php

declare(strict_types=1);

/**
 * @file
 * Analyzes Drupal configuration and generates reports.
 *
 * @see tests/e2e/ai/rules/01-analyse-drupal-configuration.prompt.mdc
 */

use Symfony\Component\Yaml\Yaml;
use Symfony\Component\Yaml\Exception\ParseException;

// Exit codes as per tooling contract.
const EXIT_SUCCESS = 0;
const EXIT_USAGE_ERROR = 1;
const EXIT_IO_ERROR = 2;
const EXIT_PARSE_ERROR = 3;

/**
 * Main entry point.
 */
function main(array $argv): int {
    try {
        $options = parse_arguments($argv);
        
        // Check if we can use cached results.
        $cache_file = dirname($options['out']) . '/.cache.hash';
        $current_hash = compute_config_hash($options['conf']);
        
        if (file_exists($cache_file) && file_exists($options['out'])) {
            $cached_hash = trim(file_get_contents($cache_file));
            if ($current_hash === $cached_hash) {
                echo "Using cached results.\n";
                echo "Output: {$options['out']}\n";
                return EXIT_SUCCESS;
            }
        }
        
        // Process configuration.
        $analysis = analyze_configuration($options['conf']);
        
        // Generate output.
        if ($options['format'] === 'json') {
            $output = json_encode(
                $analysis,
                $options['pretty'] ? (JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) : 0
            );
            echo $output . "\n";
        } else {
            $markdown = generate_markdown($analysis);
            if (!file_exists(dirname($options['out']))) {
                mkdir(dirname($options['out']), 0777, true);
            }
            file_put_contents($options['out'], $markdown);
            
            // Update cache.
            file_put_contents($cache_file, $current_hash);
            
            echo "Analysis complete.\n";
            echo "Output: {$options['out']}\n";
        }
        
        return EXIT_SUCCESS;
    } catch (RuntimeException $e) {
        fwrite(STDERR, "Error: " . $e->getMessage() . "\n");
        return $e->getCode() ?: EXIT_IO_ERROR;
    }
}

/**
 * Parse command line arguments.
 */
function parse_arguments(array $argv): array {
    $options = [
        'conf' => getcwd() . '../../../../../conf/cmi',
        'out' => getcwd() . '/drupal_config_analysis.md',
        'format' => 'md',
        'pretty' => false,
        'include_disabled' => false,
    ];
    
    $args = $argv;
    array_shift($args); // Remove script name
    
    foreach ($args as $arg) {
        if (str_starts_with($arg, '--conf=')) {
            $options['conf'] = getcwd() . '/' . substr($arg, 7);
        } elseif (str_starts_with($arg, '--out=')) {
            $options['out'] = getcwd() . '/' . substr($arg, 6);
        } elseif ($arg === '--format=json') {
            $options['format'] = 'json';
        } elseif ($arg === '--format=md') {
            $options['format'] = 'md';
        } elseif ($arg === '--pretty') {
            $options['pretty'] = true;
        } elseif ($arg === '--include-disabled') {
            $options['include_disabled'] = true;
        } elseif ($arg === '--help') {
            show_usage();
            exit(EXIT_SUCCESS);
        } else {
            throw new RuntimeException("Unknown option: $arg", EXIT_USAGE_ERROR);
        }
    }
    
    return $options;
}

/**
 * Show command usage information.
 */
function show_usage(): void {
    echo "Usage: php analyze_drupal_config.php [options]\n";
    echo "Options:\n";
    echo "  --conf=<path>      Path to configuration directory (default: ../conf/cmi)\n";
    echo "  --out=<path>       Output file path (default: drupal_config_analysis.md)\n";
    echo "  --format=md|json   Output format (default: md)\n";
    echo "  --pretty           Pretty-print JSON output\n";
    echo "  --include-disabled Include disabled configurations\n";
    echo "  --help             Show this help message\n";
}

/**
 * Compute a hash of all configuration files.
 */
function compute_config_hash(string $conf_dir): string {
    if (!is_dir($conf_dir)) {
        throw new RuntimeException("Configuration directory not found: $conf_dir", EXIT_IO_ERROR);
    }
    
    $hashes = [];
    $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($conf_dir));
    
    foreach ($files as $file) {
        if ($file->isFile() && preg_match('/\.ya?ml$/', $file->getFilename())) {
            $hashes[] = $file->getPathname() . ':' . hash_file('sha256', $file->getPathname());
        }
    }
    
    sort($hashes);
    return hash('sha256', implode('\n', $hashes));
}

/**
 * Analyze Drupal configuration.
 */
function analyze_configuration(string $conf_dir): array {
    $analysis = [
        'content_entity_types' => [],
        'config_entity_types' => [],
        'reference_fields' => [],
        'dependencies' => [],
    ];
    
    if (!is_dir($conf_dir)) {
        throw new RuntimeException("Configuration directory not found: $conf_dir", EXIT_IO_ERROR);
    }
    
    $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($conf_dir));
    
    foreach ($files as $file) {
        if (!$file->isFile() || !preg_match('/\.ya?ml$/', $file->getFilename())) {
            continue;
        }
        
        try {
            $content = file_get_contents($file->getPathname());
            $data = Yaml::parse($content);
            
            // Skip disabled configurations unless explicitly included
            if (isset($data['status']) && $data['status'] === false && !$options['include_disabled']) {
                continue;
            }
            
            // Process different types of configuration files
            if (preg_match('/([^\/]+)\.([^.]+)\.ya?ml$/', $file->getPathname(), $matches)) {
                $type = $matches[1];
                $id = $matches[2];
                
                // Handle field configurations
                if (str_starts_with($type, 'field.field.')) {
                    $parts = explode('.', $type, 4);
                    if (count($parts) >= 4) {
                        $entity_type = $parts[2];
                        $bundle = $parts[3];
                        
                        if (!isset($analysis['content_entity_types'][$entity_type])) {
                            $analysis['content_entity_types'][$entity_type] = [];
                        }
                        
                        if (!isset($analysis['content_entity_types'][$entity_type][$bundle])) {
                            $analysis['content_entity_types'][$entity_type][$bundle] = [
                                'fields' => [],
                            ];
                        }
                        
                        $field_name = $id;
                        $field_type = $data['field_type'] ?? 'unknown';
                        
                        $analysis['content_entity_types'][$entity_type][$bundle]['fields'][$field_name] = [
                            'type' => $field_type,
                            'label' => $data['label'] ?? $field_name,
                        ];
                        
                        // Check for reference fields
                        if (str_contains($field_type, 'reference') || str_contains($field_type, 'entity_reference')) {
                            $target_entity_type = $data['settings']['target_type'] ?? null;
                            $target_bundles = $data['settings']['handler_settings']['target_bundles'] ?? null;
                            
                            $analysis['reference_fields']["$entity_type.$bundle.$field_name"] = [
                                'type' => $field_type,
                                'target_entity_type' => $target_entity_type,
                                'target_bundles' => $target_bundles ? array_values($target_bundles) : null,
                            ];
                        }
                    }
                }
                // Handle entity type configurations
                elseif (str_starts_with($type, 'core.entity_')) {
                    $parts = explode('.', $type, 4);
                    if (count($parts) >= 3) {
                        $entity_type = $parts[2];
                        $bundle = $parts[3] ?? 'default';
                        
                        if (!isset($analysis['content_entity_types'][$entity_type])) {
                            $analysis['content_entity_types'][$entity_type] = [];
                        }
                        
                        if (!isset($analysis['content_entity_types'][$entity_type][$bundle])) {
                            $analysis['content_entity_types'][$entity_type][$bundle] = [
                                'fields' => [],
                            ];
                        }
                        
                        // Store display configuration
                        $analysis['content_entity_types'][$entity_type][$bundle]['display'] = $data;
                    }
                }
                // Handle other configuration types
                else {
                    $analysis['config_entity_types'][$type] = $analysis['config_entity_types'][$type] ?? [];
                    $analysis['config_entity_types'][$type][$id] = $data;
                    
                    // Extract dependencies
                    if (isset($data['dependencies'])) {
                        $analysis['dependencies']["$type.$id"] = $data['dependencies'];
                    }
                }
            }
        } catch (ParseException $e) {
            fwrite(STDERR, "Warning: Could not parse {$file->getPathname()}: {$e->getMessage()}\n");
            continue;
        }
    }
    
    return $analysis;
}

/**
 * Generate Markdown output from analysis.
 */
function generate_markdown(array $analysis): string {
    $output = "# Drupal Configuration Analysis\n\n";
    
    // Content Entity Types
    $output .= "## Content Entity Types\n\n";
    ksort($analysis['content_entity_types']);
    
    foreach ($analysis['content_entity_types'] as $entity_type => $bundles) {
        $output .= "- **$entity_type**\n";
        ksort($bundles);
        
        foreach ($bundles as $bundle => $bundle_data) {
            $output .= "  - $bundle\n";
            
            // List reference fields
            if (!empty($bundle_data['fields'])) {
                $output .= "    - Reference fields:\n";
                foreach ($bundle_data['fields'] as $field_name => $field_data) {
                    if (str_contains($field_data['type'], 'reference') || str_contains($field_data['type'], 'entity_reference')) {
                        $ref_key = "$entity_type.$bundle.$field_name";
                        $ref_info = $analysis['reference_fields'][$ref_key] ?? [];
                        $targets = $ref_info['target_bundles'] 
                            ? 'Targets: ' . implode(', ', $ref_info['target_bundles'])
                            : 'Targets: All';
                        
                        $output .= "      - `$field_name` (type: `{$field_data['type']}`) - $targets\n";
                    }
                }
            }
        }
    }
    
    // Configuration Entity Types
    $output .= "\n## Configuration Entity Types\n\n";
    ksort($analysis['config_entity_types']);
    
    foreach ($analysis['config_entity_types'] as $type => $entities) {
        $output .= "- **$type**\n";
        ksort($entities);
        
        foreach ($entities as $id => $entity) {
            $output .= "  - $id\n";
            
            // List dependencies if they exist
            $deps_key = "$type.$id";
            if (isset($analysis['dependencies'][$deps_key])) {
                $deps = $analysis['dependencies'][$deps_key];
                $output .= "    - Dependencies:\n";
                
                if (!empty($deps['config'])) {
                    $output .= "      - Config:\n";
                    foreach ($deps['config'] as $dep) {
                        $output .= "        - `$dep`\n";
                    }
                }
                
                if (!empty($deps['module'])) {
                    $output .= "      - Modules:\n";
                    foreach ($deps['module'] as $module) {
                        $output .= "        - `$module`\n";
                    }
                }
            }
        }
    }
    
    return $output;
}

// Run the script
if (PHP_SAPI === 'cli') {
    exit(main($argv));
}

return 0;
