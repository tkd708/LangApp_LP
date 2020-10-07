/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

const path = require(`path`)
require("dotenv").config()

module.exports = {
  siteMetadata: {
    title: "LangApp",
    titleTemplate: "%s | Helping startups get started",
    description:
      "A web/mobile application to boost your language speaking vocabrary",
    author: "Naoya Takeda",
    image: "/yellow-metal-design-decoration.jpg",
    siteUrl: "https://www.langapp.netlify.app",
    twitterUsername: "@twitter",
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: path.join(__dirname, `src`, `images`),
      },
    },
    `gatsby-plugin-styled-components`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-sitemap`,
  ],
}
