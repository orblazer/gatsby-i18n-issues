const config = require('./gatsby-config')

/**
 * Makes sure to create localized paths for each file in the /pages folder.
 * For example, pages/404.js will be converted to /en/404.js and /el/404.js and
 * it will be accessible from https:// .../en/404/ and https:// .../el/404/
 */
exports.onCreatePage = async ({ page, actions: { createPage, deletePage, createRedirect } }) => {
  const isEnvDevelopment = process.env.NODE_ENV === 'development'
  const originalPath = page.path
  const is404 = ['/dev-404-page/', '/404/', '/404.html'].includes(originalPath)

  // Delete the original page (since we are gonna create localized versions of it) and add a
  // redirect header
  await deletePage(page)

  // Regardless of whether the original page was deleted or not, create the localized versions of
  // the current page
  await Promise.all(
    config.siteMetadata.supportedLanguages.map(async (lang) => {
      const localizedPath = `/${lang}${page.path}`

      // create a redirect based on the accept-language header
      createRedirect({
        fromPath: originalPath,
        toPath: localizedPath,
        Language: lang,
        isPermanent: false,
        redirectInBrowser: isEnvDevelopment,
        statusCode: is404 ? 404 : 301,
      })

      await createPage({
        ...page,
        path: localizedPath,
        ...(originalPath === '/404/' ? { matchPath: `/${lang}/*` } : {}),
        context: {
          ...page.context,
          originalPath,
          lang,
        },
      })
    })
  )

  // Create a fallback redirect if the language is not supported or the
  // Accept-Language header is missing for some reason
  createRedirect({
    fromPath: originalPath,
    toPath: `/${config.siteMetadata.defaultLanguage}${page.path}`,
    isPermanent: false,
    redirectInBrowser: isEnvDevelopment,
    statusCode: is404 ? 404 : 301,
  })
}
