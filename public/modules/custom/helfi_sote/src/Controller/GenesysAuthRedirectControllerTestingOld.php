<?php

namespace Drupal\helfi_sote\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * Genesys auth redirect controller.
 */
class GenesysAuthRedirectControllerTestingOld extends ControllerBase {

  /**
   * Returns a renderable array with attached JavaScript.
   */
  public function content() {
    $build = [
      '#markup' => $this->t('Redirecting...'),
      '#attached' => [
        'library' => ['helfi_sote/genesys_auth_redirect_test_old'],
      ],
    ];

    return $build;
  }

}
