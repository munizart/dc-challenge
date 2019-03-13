const path = require('path')
const Sequence = require('../../lib/sequence')
const inputFilePath = path.join(__dirname, '..', '..', 'input-dump')
const get = require('./get')

Sequence.fromFile(inputFilePath)
  .map((line) => JSON.parse(line))
  .reduce(
    (groups, { productId, image }) => {
      // group by productId
      groups.product[productId] = groups.product[productId] || []
      groups.product[productId].push(image)

      // count by image
      groups.image[image] = (groups.image[image] || 0) + 1
      return groups
    },
    { product: {}, image: {} }
  )
  .then((groups) => {
    const totalProductsFromURL = (url) => groups.image[url] || 0
    const imagesFromProductId = (productId) => groups.product[productId] || []
    const productIds = Object.keys(groups.product)

    productIds.reduce(async (previous, productId) => {
      await previous // waiting previous product to be printed

      const imageURLS = imagesFromProductId(productId).sort(
        (imageA, imageB) =>
          totalProductsFromURL(imageB) - totalProductsFromURL(imageA)
      )

      const okImages = []
      let i = 0
      do {
        const imageURL = imageURLS[i]
        i++

        await get(imageURL)
          .then(() => {
            okImages.push(imageURL)
          })
          .catch((ignoredError) => {})
      } while (okImages.length < 3 && i < imageURLS.length)

      console.log(JSON.stringify({ productId, images: okImages }))
    }, Promise.resolve())
  })
