let pickerOpen = false

// Prototype only: never return File objects, handles, input.value or native paths.
export const selectBrowserFolder = () => {
  if (pickerOpen) return Promise.reject(new Error('A folder picker is already open.'))
  pickerOpen = true

  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.setAttribute('webkitdirectory', '')
    input.multiple = true
    input.hidden = true
    input.dataset.testid = 'library-folder-picker'

    const finish = (folder, error) => {
      input.removeEventListener('change', onChange)
      input.removeEventListener('cancel', onCancel)
      input.value = ''
      input.remove()
      pickerOpen = false
      if (error) reject(error)
      else resolve(folder)
    }
    const onCancel = () => finish(null)
    const onChange = () => {
      if (!input.files?.length) return finish(null)
      try {
        const relativeName = input.files[0].webkitRelativePath
        if (!relativeName?.includes('/')) throw new Error('This browser did not provide a directory name.')
        const name = relativeName.split('/')[0]
        const id = `library-${crypto.randomUUID()}`
        finish({ id, path: `browser-folder:${encodeURIComponent(name)}#${id}`, status: 'online' })
      } catch (error) {
        finish(null, error)
      }
    }
    input.addEventListener('change', onChange)
    input.addEventListener('cancel', onCancel)
    document.body.appendChild(input)
    try { input.click() } catch (error) { finish(null, error) }
  })
}