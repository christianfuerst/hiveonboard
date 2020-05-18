export const muiThemeConfig = {
  palette: {
    background: {
      default: "#e7e7f1",
    },
    primary: {
      light: "#e8425f",
      main: "#e31337",
      dark: "#9e0d26",
    },
    secondary: {
      light: "#4d5053",
      main: "#212529",
      dark: "#17191c",
    },
  },
};

export const tos = [
  "You have to agree to this terms of service:",
  "- In order to prevent abuse & spam a verification of your phone number is required. Your data won't be used for any other purpose than that.",
  "- In the process of account creation a meta-information will be put into your account, which will suggest default beneficiaries when creating a post. It's up to dApps to support this feature.",
  "- The default beneficiaries meta-information proposes sharing a total of 5% of your rewards with accounts which referred you, funded the operation and provided this service.",
  "- The default beneficiaries meta-information can be changed or removed entirely on a blockchain level at any time.",
  "- Please beware of the fact, that removing this meta-information could result in loosing delegated HIVE POWER to your account from beneficiaries. It is recommended to obtain HIVE on your own and powering your account in this case.",
];

export const landingContent = [
  {
    image: "images/social_hive_lets-talk-community.jpg",
    overline: "What is HIVE?",
    heading: "Learn",
    text:
      "Learn everything you need to know about HIVE, it's benefits and why it's the future of social media.",
    to: "/what-is-hive",
  },
  {
    image: "images/social_hive_lets-talk-onboarding.jpg",
    overline: "Get Onboard",
    heading: "Create Account",
    text:
      "Create a HIVE account, start today and get engaged. The community is waiting for you!",
    to: "/create-account",
  },
  {
    image: "images/social_hive_lets-talk-dapps.jpg",
    overline: "Discover dApps",
    heading: "Explore",
    text:
      "Try out all those awesome dApps and start earning and investing into HIVE cryptocurrency tokens.",
    to: "/discover-dapps",
  },
];

export const dApps = [
  {
    icon: "peakd.svg",
    name: "PeakD",
    subtitle: "Full-featured blog",
    text: "The entry point for your decentralized world",
    url: "https://peakd.com",
  },
  {
    icon: "hiveblog.png",
    name: "Hive.blog",
    subtitle: "Basic blog",
    text: "Community Interface for Hive",
    url: "https://hive.blog",
  },
  {
    icon: "3speak.svg",
    name: "3Speak",
    subtitle: "Decentralized video",
    text: "Censorship Resistant Video Platform",
    url: "https://3speak.online?utm_source=hiveonboard",
  },
  {
    icon: "esteem.svg",
    name: "Esteem",
    subtitle: "Device-friendly blog",
    text: "Mobile & Desktop App for Hive",
    url: "https://esteem.app",
  },
];
