// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

// Site title and description
export const SITE_LANG = "en";
export const SITE_TAB = "MERLETTE";
export const SITE_TITLE = "MERLETTE";
export const SITE_DESCRIPTION = "A homepage hidden in the corners of the internet.";
export const DATE_FORMAT = "ddd MMM DD YYYY";

// User profile information
export const USER_NAME = "MERLETTE";
export const USER_SITE = "https://merlette.pages.dev"; // At the same time, this is also the site retrieved by the i18n configuration.
export const USER_AVATAR = "/profile.webp";

// Server and transition settings
export const SERVER_URL = "https://merlette.pages.dev";

// Theme settings
export const DAISYUI_THEME = {
  light: "winter",
  dark: "dracula",
};
export const CODE_THEME = {
  light: "github-light",
  dark: "github-dark",
};

// Menu items for navigation
export const menuItems = [
  { id: "home", text: "Home", href: "/", svg: "material-symbols:home-outline-rounded", target: "_self" }, // Home page
  { id: "about", text: "About", href: "/about", svg: "material-symbols:info-outline-rounded", target: "_self" }, // About page
  {
    id: "blog",
    text: "Blogs",
    href: "/blog",
    svg: "material-symbols:book-2-outline-rounded",
    target: "_self",
    subItems: [
      {
        id: "all",
        text: "All blogs",
        href: "/blog",
        svg: "material-symbols:ink-pen-outline-rounded",
        target: "_self",
      }, // All blog
      {
        id: "guide",
        text: "Tech blogs",
        href: "/blog/categories/guide",
        svg: "material-symbols:deployed-code-outline",
        target: "_self",
      }, // Guide category
      /*
      {
        id: "life",
        text: "Life blogs",
        href: "/blog/categories/life",
        svg: "material-symbols:earthquake-rounded",
        target: "_self",
      }, // Life category
      */
    ],
  }, // Blog page with sub-items
  {
    id: "project",
    text: "Project",
    href: "/project",
    svg: "material-symbols:code-blocks-outline",
    target: "_self",
  }, // Projects page
  /*
  {
    id: "friend",
    text: "Friend",
    href: "/friend",
    svg: "material-symbols:supervisor-account-outline-rounded",
    target: "_self",
  }, // Friends page
  */
  {
    id: "contact",
    text: "Contact",
    href: "mailto:merlette@aliyun.com", // Contact email
    target: "_blank", // Open in a new tab
    svg: "material-symbols:attach-email-outline-rounded",
  },
];

// Social media and contact icons
export const socialIcons = [
  {
    href: "https://github.com/merlette",
    ariaLabel: "Github",
    title: "Github",
    svg: "mingcute:github-line",
  },
  {
    href: "https://space.bilibili.com/519830795",
    ariaLabel: "BiliBili",
    title: "BiliBili",
    svg: "mingcute:bilibili-line",
  },
  {
    href: "https://www.youtube.com/@merlet_te",
    ariaLabel: "YouTube",
    title: "YouTube",
    svg: "mingcute:youtube-line",
  },
  {
    href: "https://x.com/merlet_te",
    ariaLabel: "X",
    title: "X",
    svg: "mingcute:social-x-line",
  },
  /*
  {
    href: "/rss.xml",
    ariaLabel: "RSS Feed",
    title: "RSS Feed",
    svg: "ri:rss-line",
  },
  */
];
