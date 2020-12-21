/* eslint-disable no-undef */

document.addEventListener('DOMContentLoaded', () => {
  modalShow()
  tabSwapper()
  flash()
})

function flash () {
  const fList = Array.from(document.querySelectorAll('.flash'))

  for (let i = 0; i < fList.length; i++) {
    const close = fList[i].querySelector('.flash-close')

    close.addEventListener('click', e => {
      e.preventDefault()
      anime({
        targets: fList[i],
        opacity: 0,
        duration: 400,
        easing: 'linear',
        complete: (a) => {
          document.body.removeChild(fList[i])
        }
      })
    })
  }
}

function modalShow () {
  const accButton = document.querySelector('#acc-icon')
  let modalTarget = '#account-modal'
  let played = false

  const modalTL = anime.timeline({
    targets: modalTarget,
    duration: 200, // Can be inherited
    easing: 'easeInQuad' // Can be inherited

  })

  accButton.addEventListener('click', (e) => {
    e.preventDefault()

    modalTarget = e.currentTarget.hash ? e.currentTarget.hash : modalTL

    // let modal = document.querySelector(modalTarget);
    // modal.style.visibility = 'visible';

    if (!played) {
      modalTL.add({
        zIndex: 5

      })

      modalTL.add({
        targets: modalTarget,
        opacity: 1

      })
        .add({
          targets: modalTarget + '>div',
          scale: [0, 1]

        })
    } else {
      modalTL.reverse()
      modalTL.play()
    }

    modalTL.finished.then(() => {
      played = true
    })
  })

  const closeButton = document.querySelector('.modal-close')

  closeButton.addEventListener('click', () => {
    modalTL.reverse()
    modalTL.play()
  })
}

function tabSwapper () {
  const tabLinks = Array.from(document.querySelectorAll('.tab'))
  let swaped = false

  const swapTL = anime.timeline({
    duration: 200, // Can be inherited
    easing: 'easeInOutQuad' // Can be inherited
  })

  for (let i = 0; i < tabLinks.length; i++) {
    tabLinks[i].addEventListener('click', (e) => {
      tabLinks.map((link) => link.classList.remove('bold'))
      tabLinks[i].classList.add('bold')

      const w = document.querySelector('.tab-content form').clientWidth
      // const h = document.querySelector('.tab-content .pg-' + (i + 1) + '-body').clientHeight
      // let tabParent = document.querySelector(".tab-content")

      // tabParent.style.height = ""+h;

      anime({
        targets: '.tab-content',
        duration: 300,
        easing: 'easeInOutQuad',
        height: document.querySelector('.tab-content .pg-' + (i + 1) + '-body').clientHeight
      })

      if (!swaped) {
        for (let j = 1; j <= tabLinks.length; j++) {
          swapTL.add({
            targets: '.tab-content .pg-' + j + '-body .input',
            translateX: (el, k) => {
              return w * (-i) // distance * (-0, -1, -2 )
              // +(-offset*(page%3)); //offset is 0 (if odd page: 3,5) or offset
            },
            delay: anime.stagger(70)
          })
        }
      } else {
        swapTL.reverse()
        swapTL.play()
      }

      swapTL.finished.then(() => {
        swaped = true
      })
    })
  }
}

/* The menu is totally usable without JavaScript, but the few lines make it more beautiful */

const topMenu = document.querySelector('.flyout-content')

function topMenuOpen (e) {
  this.classList.add('open')

  let elem = this
  while (elem.parentNode !== topMenu) {
    if (elem.nodeName.toLowerCase() === 'li') {
      elem.classList.add('open')
    }
    elem = elem.parentNode
  }
  if (e && e.target && e.target.nodeName.toLowerCase() === 'a') {
    e.preventDefault()
  }
}
function topMenuClose (e) {
  this.classList.remove('open')

  let elem = this
  while (elem.parentNode !== topMenu) {
    if (elem.nodeName.toLowerCase() === 'li') {
      elem.classList.remove('open')
    }
    elem = elem.parentNode
  }

  if (e && e.target && e.target.nodeName.toLowerCase() === 'a') {
    e.preventDefault()
  }
}

function locationListen (e) {
  const filter = document.querySelector('.search-filter')
  const cf = containsFilter(filter, this.innerText)
  if (cf) return

  const newLocation = document.createElement('span')
  newLocation.innerText = this.innerText
  newLocation.innerHTML += '<img src="/images/svg/cross.svg" alt="close">'

  if (e && e.target && e.target.nodeName.toLowerCase() === 'a') {
    e.preventDefault()
    e.target.style.boxShadow = '-4px -4px 6px rgba(255, 255, 255, 0.7), 4px 4px 6px #c0d3de, inset -4px -4px 12px rgba(255, 255, 255, 0.1), inset 4px 4px 12px #e8eff3'
    filter.appendChild(newLocation)
    deleteListen(newLocation, e.target)
  }
}

function deleteListen (newLocation, link) {
  const close = newLocation.querySelector('img')
  close.addEventListener('click', e => {
    link.style.boxShadow = 'none'
    newLocation.remove()
  })
}

function containsFilter (filter, value) {
  for (let i = 0; i < filter.children.length; i++) {
    const child = filter.children[i]

    if (child.innerText === value) return true
  }
  return false
}

Array.prototype.forEach.call(topMenu.querySelectorAll('ul>li'), function (li) {
  if (!li.getElementsByTagName('ul')) {
    return
  }

  li.addEventListener('mouseleave', topMenuClose.bind(li), false)
  li.addEventListener('mouseenter', topMenuOpen.bind(li), false)
})

Array.prototype.forEach.call(topMenu.querySelectorAll('li>a, li>h3'), function (link) {
  if (!link.parentNode.getElementsByTagName('ul')) {
    return
  }

  link.addEventListener('blur', topMenuClose.bind(link.parentNode), false)
  link.addEventListener('focus', topMenuOpen.bind(link.parentNode), false)
  link.addEventListener('click', locationListen.bind(link.parentNode), false)
})
