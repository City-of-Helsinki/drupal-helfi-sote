# City of Helsinki - SOTE Drupal project

SOTE, short for Sosiaali- ja terveyspalvelut, is a site providing information about the health and social services in
the city of Helsinki. The project is sometimes referred to simply as Terveys.

## Environments

Env | Branch | Drush alias | URL
--- | ------ | ----------- | ---
development | * | - | http://helfi-sote.docker.so/
production | main | @main | https://hel.fi/fi/sosiaali-ja-terveyspalvelut

## Requirements

You need to have these applications installed to operate on all environments:

- [Docker](https://github.com/druidfi/guidelines/blob/master/docs/docker.md)
- [Stonehenge](https://github.com/druidfi/stonehenge)
- For the new person: Your SSH public key needs to be added to servers

## Create and start the environment

For the first time (new project):

``
$ make new
``

And following times to create and start the environment:

``
$ make fresh
``

NOTE: Change these according of the state of your project.

## CSS-files not loading?
If stylesheets are not loading correctly, you need to give write access to
``public/sites/default/files``

Run ``make drush-cr; drush-uli`` after this.


## Login to Drupal container

This will log you inside the app container:

```
$ make shell
```

## Instance specific features

### Custom paragraphs

#### Health Station Search (health_station_search)
The Health Station Search paragraph lets the user filter health stations based on their home address. The health
stations are TPR entities that are categorized as such.

This search functionality is built with React and utilizes a Views listing (`health_station_search`) as a fallback
when JavaScript is disabled. All React-based searches are located in the `hdbt` theme, where most of the related logic
is implemented. Some templating is done for the fallback View in the [`hdbt_subtheme`](https://github.com/City-of-Helsinki/drupal-helfi-sote/tree/dev/public/themes/custom/hdbt_subtheme/templates/views).

- The fallback listing is a View called (`health_station_search`) and it doesn't have any filters. The fallback View
configuration can be found in [here](https://github.com/City-of-Helsinki/drupal-helfi-sote/blob/dev/conf/cmi/views.view.health_station_search.yml).
- The search has a React front and the code can be found [here](https://github.com/City-of-Helsinki/drupal-hdbt/tree/main/src/js/react/apps/health-station-search).
- The paragraph has editable title and description fields.
- Can be added to landing pages.
- The index that the search uses is called Health stations (`health_stations`).

#### Maternity and Child Health Clinic Search (maternity_and_child_health_clini)
The Maternity and Child Health Clinic Search lists these clinics and lets user filter the clinics based on their home
address. The clinics are TPR entities that are categorized as such.

The machine name of this paragraph might look that its cut short but that is the correct machine name. This search
functionality is built with React and utilizes a Views listing (`maternity_and_child_health_clinics_search`) as a
fallback when JavaScript is disabled. All React-based searches are located in the `hdbt` theme, where most of the
related logic is implemented. Some templating is done for the fallback View in the [`hdbt_subtheme`](https://github.com/City-of-Helsinki/drupal-helfi-sote/tree/dev/public/themes/custom/hdbt_subtheme/templates/views).

- The fallback listing is a View called (`maternity_and_child_health_clinics_search`) and it doesn't have any filters.
The fallback View configuration can be found in [here](https://github.com/City-of-Helsinki/drupal-helfi-sote/blob/dev/conf/cmi/views.view.maternity_and_child_health_clinics_search.yml).
- The search has a React front and the code can be found [here](https://github.com/City-of-Helsinki/drupal-hdbt/tree/main/src/js/react/apps/maternity-and-child-health-clinic-search).
- The paragraph has editable title and description fields.
- Can be added to landing pages.
- The index that the search uses is called maternity and child health clinic (`maternity_and_child_health_clinic`).

### IBM Watson Chat
The SOTE instance uses the IBM Watson Chatbot implementation. It has two blocks for controlling the visibility of the
chat with one being the default and the other exceptions. You can configure the blocks for the chats on the block
layout page (admin/structure/block). More documentation about the IBM Watson chatbot is available in [Confluence](https://helsinkisolutionoffice.atlassian.net/wiki/spaces/HEL/pages/8145469986/IBM+Chat+App+Drupal+integration),
and the code for the Drupal block can be found [here](https://github.com/City-of-Helsinki/drupal-helfi-platform-config/blob/main/src/Plugin/Block/IbmChatApp.php).

### Template customization for the TPR entities
SOTE has customization on how the Errand services and Service Channels are displayed. Customization can be found from
the `hdbt_subtheme` templates folder [here](https://github.com/City-of-Helsinki/drupal-helfi-sote/tree/dev/public/themes/custom/hdbt_subtheme/templates/module/helfi_tpr).

### Unit Search (unit_search) override
The default Unit Search View is overridden in the SOTE instance and the code can be found form the [`helfi_sote_config`](https://github.com/City-of-Helsinki/drupal-helfi-sote/tree/dev/public/modules/custom/helfi_sote_config)
custom module.
