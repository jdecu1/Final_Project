export default {
  template: `
    <div class="app-wrapper">

      <!-- TOP NAV BAR -->
      <nav>
        <div class="nav-top">
          <div class="title">Collision Reconstruction App</div>
        </div>

        <div class="nav-links">
          <router-link to="/">Cases</router-link>
          <router-link to="/create">Create Case</router-link>
          <router-link to="/about">About</router-link>
        </div>
      </nav>

      <!-- SCROLLABLE CONTENT AREA -->
      <div class="content-wrapper">
        <router-view></router-view>
      </div>

      <!-- BOTTOM NAV BAR -->
      <div class="bottom-nav">
        <button class="back-btn" @click="$router.back()">Back</button>

        <div class="footer-text">
          Web App courtesy of Joseph L. DeCurtis Jr<br>
          University of New Haven
        </div>
      </div>

    </div>
  `
};


