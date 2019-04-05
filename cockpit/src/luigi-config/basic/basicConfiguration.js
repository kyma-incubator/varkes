//you can now use ES6 goodies here
Luigi.setConfig({
  settings: {
    hideNavigation: false,
    backdropDisabled: false,
    header: {
      title: 'Varkes',
      logo: '/assets/logo.svg',
    }
  },
  navigation: {
    nodes: [
      {
        label: 'Home',
        pathSegment: 'home',
        viewUrl: '/angular.html',
        hideSideNav: true
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
