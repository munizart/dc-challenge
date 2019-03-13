// avoid open redis connections on tests
module.exports = {
  createClient: () => {}
}
