module.exports = {
  siteMetadata: {
    title: "Complete Intro to Containers",
    subtitle: "🐳",
    description: "A complete intro to Linux containers for developers",
    keywords: [
      "linux",
      "containers",
      "javascript",
      "node",
      "brian holt",
      "frontend masters",
      "nodejs"
    ]
  },
  pathPrefix: "/complete-intro-to-containers", // if you're using GitHub Pages, put the name of the repo here with a leading slash
  plugins: [
    `gatsby-plugin-layout`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/lessons`,
        name: "markdown-pages"
      }
    },
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          `gatsby-remark-autolink-headers`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-prismjs`,
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 800,
              linkImagesToOriginal: true,
              sizeByPixelDensity: false
            }
          }
        ]
      }
    }
  ]
};
