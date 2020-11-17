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
    titleTemplate: "%s | あなたの英会話をAIが記録・分析するアプリ",
    description:
      "あなたの英会話をAIが記録・分析することで効率的な復習をサポートします。",
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
    {
        resolve: `gatsby-plugin-google-analytics`,
        options: {
            trackingId: process.env.GATSBY_GOOGLE_ANALYTICS_ID,
        },
    },
    `gatsby-plugin-styled-components`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-sitemap`,
  ],
}
