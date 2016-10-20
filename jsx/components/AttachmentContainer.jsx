import Browse from './Browse.jsx'

export default class AttachmentContainer extends Browse {
  urlFormat (newPage) {
    return '/attachments/' + newPage + '/'
  }

  apiUrl () {
    return '/api/attachments/'
  }
}
