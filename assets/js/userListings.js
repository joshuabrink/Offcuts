// const { response } = require('express')

function deleteListing (id) {
  return fetch('/deleteListing/' + id, {
    method: 'DELETE',
    redirect: 'follow'
  })
    // .then(response => {
    //   if (response.status === 200) {
    //     window.location.href = response.url
    //   }
    // })
    .then(response => response.json())
    .then(data => { return data })
}

const deleteContainers = document.querySelectorAll('.delete-container')
const confirmContainer = document.createElement('div')
confirmContainer.classList.add('row')
confirmContainer.innerHTML += '<a class="neu confirm" href="#"><svg height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0zm0 0h24v24H0V0z" fill="none"/><path d="M16.59 7.58L10 14.17l-3.59-3.58L5 12l5 5 8-8zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg></a>'
confirmContainer.innerHTML += '<a class="neu cancel" href="#"><svg height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>'
const responseContainer = document.querySelector('.query-result')
// const responseContainer = document.createElement('div')
// responseContainer
/* <div class="flash ok row neu-static bg-color">
                    Your Listing asdasd was deleted
                <a title="Close" class="flash-close flex">
                    <svg viewBox="0 0 24 24" width="18px" height="18px"><path class="light" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
                </a>
            </div> */

const confirmListen = (deleteContainer, confirmContainer) => {
  const deleteLink = deleteContainer.querySelector('.delete-link')
  deleteLink.addEventListener('click', e => {
    e.preventDefault()
    const id = deleteLink.getAttribute('href')
    deleteContainer.innerHTML = confirmContainer.innerHTML
    const confirm = deleteContainer.querySelector('.confirm')
    const cancel = deleteContainer.querySelector('.cancel')

    confirm.addEventListener('click', async e => {
      e.preventDefault()
      const data = await deleteListing(deleteLink.getAttribute('href'))
      showResponse(responseContainer, data)
      deleteContainer.parentElement.remove()
    })

    cancel.addEventListener('click', e => {
      e.preventDefault()
      deleteContainer.innerHTML = '<a class="delete-link neu" href="' + id + '">Delete</a>'
      confirmListen(deleteContainer, confirmContainer)
    })
  })
}

const showResponse = (resultContainer, data) => {
  resultContainer.innerText = data.msg
  setTimeout(() => {
    resultContainer.innerText = ''
  }, 3000)
}
deleteContainers.forEach(el => {
  confirmListen(el, confirmContainer)
})

// for (let i = 0; i < deletes.length; i++) {
//   const deleteLink = deletes[i]

// }
