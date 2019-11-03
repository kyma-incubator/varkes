//you can now use ES6 goodies here
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function () {
  if (xhttp.readyState == 4 && xhttp.status == 200) {
    var config = JSON.parse(xhttp.responseText);
    Luigi.setConfig({
      settings: {
        hideNavigation: false,
        backdropDisabled: false,
        header: {
          title: (config.name ? config.name : 'Varkes'),
          logo: '/logo',
        }
      },
      navigation: {
        nodes: [
          {
            pathSegment: '',
            viewUrl: '/angular.html',
            hideSideNav: true,
            hideFromNav: true,
            context: { config: config },
            children: [
              {
                path: 'apitable'
              }]
          },
          {
            pathSegment: 'apiview',
            viewUrl: "/angular.html#/apiview",
            hideSideNav: true,
            hideFromNav: true,
            context: { config: config },
            children: [
              {
                pathSegment: ":id",
                viewUrl: "/angular.html#/apiview/:id",
                hideSideNav: true,
                hideFromNav: true,
                children: [
                  {
                    pathSegment: ":remote",
                    viewUrl: "/angular.html#/apiview/:id/:remote",
                    hideSideNav: true,
                    hideFromNav: true,
                  }
                ]
              }
            ]
          },
          {
            pathSegment: "createapi",
            viewUrl: "/angular.html#/createapi",
            context: { config: config },
            hideSideNav: true,
            hideFromNav: true,
            children: [
              {
                pathSegment: ":event",
                viewUrl: "/angular.html#/createapi/:event",
                hideSideNav: true,
                hideFromNav: true
              }
            ]
          }
        ]
      },
      routing: {
        /**
         * Development:
         * For path routing, set to false
         * For hash routing, set to true
         */
        useHashRouting: true
      }
    });

  }
};
xhttp.open("GET", "/config", true);
xhttp.send();
