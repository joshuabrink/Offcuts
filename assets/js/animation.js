/* eslint-disable no-undef */

document.addEventListener('DOMContentLoaded', () => {
  modalShow()
  tabSwapper('.tab', '.col')
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
    // e.preventDefault()

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

function tabSwapper (tabSelector = '.tab', inputSelector = '.input') {
  const tabLinks = Array.from(document.querySelectorAll(tabSelector))
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
            targets: '.tab-content .pg-' + j + '-body ' + inputSelector,
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
  this.classList.add('neu-static')

  let elem = this
  while (elem.parentNode !== topMenu) {
    if (elem.nodeName.toLowerCase() === 'li') {
      elem.classList.add('neu-static')
    }
    elem = elem.parentNode
  }
  if (e && e.target && e.target.nodeName.toLowerCase() === 'a') {
    e.preventDefault()
  }
}
function topMenuClose (e) {
  this.classList.remove('neu-static')

  let elem = this
  while (elem.parentNode !== topMenu) {
    if (elem.nodeName.toLowerCase() === 'li') {
      elem.classList.remove('neu-static')
    }
    elem = elem.parentNode
  }

  if (e && e.target && e.target.nodeName.toLowerCase() === 'a') {
    e.preventDefault()
  }
}

function locationListen (e) {
  const filter = document.querySelector('.search-filter')
  if (!filter.classList.contains('flex-1')) filter.classList.add('flex-1')

  const cf = containsFilter(filter, this.innerText)
  if (cf) return

  const newLocation = document.createElement('span')
  newLocation.classList.add('neu-static')
  newLocation.classList.add('bg-color')
  newLocation.innerText = this.innerText
  newLocation.innerHTML += '<svg viewBox="0 0 24 24" width="18px" height="18px"><path class="light" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'

  if (e && e.target && e.target.nodeName.toLowerCase() === 'a') {
    e.preventDefault()
    e.target.classList.add('neu-static')
    filter.appendChild(newLocation)
    deleteListen(newLocation, e.target)
  }
}

function deleteListen (newLocation, link) {
  const close = newLocation.querySelector('svg')
  const filter = document.querySelector('.search-filter')
  close.addEventListener('click', e => {
    link.style.boxShadow = 'none'
    newLocation.remove()

    if (filter.classList.contains('flex-1') && !filter.childElementCount > 0) filter.classList.remove('flex-1')
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

// autoComplete.js input eventListener for search results event
document.querySelector('#autoComplete').addEventListener('results', (event) => {
  console.log(event)
})

// The autoComplete.js Engine instance creator
const autoCompleteJS = new autoComplete({
  name: 'listings',
  selector: '#autoComplete',
  observer: false,
  data: {
    src: async () => {
      // Loading placeholder text
      document
        .querySelector('#autoComplete')
        .setAttribute('placeholder', 'Loading...')
      // Fetch External Data Source
      const query = document.querySelector('#autoComplete').value
      // Fetch External Data Source
      const source = await fetch(`http://localhost:3000/listings/search/${query}/`, {
        method: 'GET'
      })
      const data = await source.json()
      // Saves the fetched data into local storage
      localStorage.setItem('acData', JSON.stringify(data))
      // Retrieve the cached data from local storage
      const localData = JSON.parse(localStorage.getItem('acData'))
      // Post loading placeholder text
      document
        .querySelector('#autoComplete')
        .setAttribute('placeholder', autoCompleteJS.placeHolder)
      // Returns Fetched data
      return localData
    },
    key: ['title', 'material'],
    results: (list) => {
      // Filter duplicates
      const filteredResults = Array.from(
        new Set(list.map((value) => value.match))
      ).map((val2) => {
        return list.find((value) => value.match === val2)
      })

      return filteredResults
    }
  },
  trigger: {
    event: ['input', 'focus']
  },
  placeHolder: 'Search',
  searchEngine: 'strict',
  highlight: true,
  maxResults: 5,
  threshold: 3,
  debounce: 300,
  resultsList: {
    destination: '.search-filter',
    container: (source) => {
      source.classList.add('neu-static')
      source.classList.add('bg-color')
      source.classList.add('flex-1')
    }
  },
  resultItem: {
    content: (data, element) => {
      // Prepare Value's Key
      const key = Object.keys(data.value).find(
        (key) => data.value[key] === element.innerText
      )
      element.classList.add('row')
      element.classList.add('between')
      element.classList.add('neu')

      // Modify Results Item
      // element.style = 'display: flex; justify-content: space-between;'
      element.innerHTML = `<span>
        ${element.innerHTML}</span>
        <span style="display: flex; align-items: center; font-size: 13px; font-weight: 100; text-transform: uppercase;">
      ${key}</span>`
    }
  },
  noResults: (dataFeedback, generateList) => {
    // Generate autoComplete List
    generateList(autoCompleteJS, dataFeedback, dataFeedback.results)
    // No Results List Item
    const result = document.createElement('li')
    result.setAttribute('class', 'no_result')
    result.setAttribute('tabindex', '1')
    result.innerHTML = `<span style="display: flex; align-items: center; font-weight: 100; color: rgba(0,0,0,.2);">Found No Results for "${dataFeedback.query}"</span>`
    document
      .querySelector(`#${autoCompleteJS.resultsList.idName}`)
      .appendChild(result)
  },
  onSelection: (feedback) => {
    document.querySelector('#autoComplete').blur()
    // Prepare User's Selected Value
    const selection = feedback.selection.value[feedback.selection.key]
    // Render selected choice to selection div
    // document.querySelector('.selection').innerHTML = selection
    // Replace Input value with the selected value
    document.querySelector('#autoComplete').value = selection
    // Console log autoComplete data feedback
    console.log(feedback)
  }
})
// account icon initials
const hi = document.querySelector('#acc-icon')
//const username = document.getElementById('name').value
//const surname = document.getElementById('surname').value
//const initials = username.charAt(0).concat(surname.charAt(0))
//hi.querySelector('text').textContent = initials

//display promoted
const asyncReq = async (action, method, body, callback) => {
  return await fetch(action, {
    method: method,
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then(function (res) {
      return res.json(); //convert response into readable data and return it to the callback functions
    })
    .then(callback)
    .catch(function (err) {
      console.log(err);
    });
};

const promoted = document.querySelector('.promoted');
asyncReq('listings/promoted', 'post',{},(listings)=>{
    for(var i = 0 ; i < listings.length; i++){
      let img = listings[i].images[0];
      img = img.substring(0, img.lastIndexOf('\'') + 1) + 'thumb-' + img.substring(img.lastIndexOf('\'') + 1);
      promoted.innerHTML+=`<a class="listing col neu" href="/listings/${listings[i].material}/${ listings[i].type }/${ listings[i]._id }">

      <div class="img-count row bg-color">
        <svg height="24" viewBox="0 0 24 24" width="24"><circle class="light" cx="12" cy="12" r="3.2"/><path class="light" d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
        <!-- <img src="/images/svg/camera.svg" alt="image count"> -->
        <span>${ listings[i].images.length } </span>
      </div>
      
        <img class="listing-img" loading="lazy" onerror="this.src='/images/svg/notfound.svg'" src="${ img }" alt="listing preview" >
     
       
        
      <div class="listing-header">
        <p class="truncate-overflow">${ listings[i].title }</p>
      </div>
      <div class="listing-body">
        <p class="price">R ${ listings[i].price }</p>
        <div class="location row">
          <svg height="24" viewBox="0 0 24 24" width="24" class="top">
            <path class="light" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
          <!-- <img src="/images/svg/location.svg" alt="loaction"> -->
          <p>${ listings[i].location }</p>
        </div>
      </div>

    </a>`
    }
});

// eslint-disable-next-line no-new
// new autoComplete({
//   data: { // Data src [Array, Function, Async] | (REQUIRED)
//     src: async () => {
//       // API key token
//       const token = 'this_is_the_API_token_number'
//       // User search query
//       const query = document.querySelector('#autoComplete').value
//       // Fetch External Data Source
//       const source = await fetch(`https://wordsapiv1.p.rapidapi.com/words/${query}/examples`, {
//         method: 'GET',
//         headers: {
//           'x-rapidapi-key': '98d5fa80c4msh579284da678ecbbp1fd930jsn7ddeeaa4e9f5',
//           'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com'
//         }
//       })
//       // Format data into JSON
//       const data = await source.json()
//       // Return Fetched data
//       return data.recipes
//     },
//     key: ['title'],
//     cache: false
//   },
//   query: { // Query Interceptor               | (Optional)
//     manipulate: (query) => {
//       return query.replace('pizza', 'burger')
//     }
//   },
//   sort: (a, b) => { // Sort rendered results ascendingly | (Optional)
//     if (a.match < b.match) return -1
//     if (a.match > b.match) return 1
//     return 0
//   },
//   placeHolder: 'Food & Drinks...', // Place Holder text                 | (Optional)
//   selector: '#autoComplete', // Input field selector              | (Optional)
//   observer: true, // Input field observer | (Optional)
//   threshold: 3, // Min. Chars length to start Engine | (Optional)
//   debounce: 300, // Post duration for engine to start | (Optional)
//   searchEngine: 'strict', // Search Engine type/mode           | (Optional)
//   resultsList: { // Rendered results list object      | (Optional)
//     container: source => {
//       source.setAttribute('id', 'food_list')
//     },
//     destination: '#autoComplete',
//     position: 'afterend',
//     element: 'ul'
//   },
//   maxResults: 5, // Max. number of rendered results | (Optional)
//   highlight: true, // Highlight matching results      | (Optional)
//   resultItem: { // Rendered result item            | (Optional)
//     content: (data, source) => {
//       source.innerHTML = data.match
//     },
//     element: 'li'
//   },
//   noResults: (dataFeedback, generateList) => {
//     // Generate autoComplete List
//     generateList(autoCompleteJS, dataFeedback, dataFeedback.results)
//     // No Results List Item
//     const result = document.createElement('li')
//     result.setAttribute('class', 'no_result')
//     result.setAttribute('tabindex', '1')
//     result.innerHTML = `<span style="display: flex; align-items: center; font-weight: 100; color: rgba(0,0,0,.2);">Found No Results for "${dataFeedback.query}"</span>`
//     document.querySelector(`#${autoCompleteJS.resultsList.idName}`).appendChild(result)
//   },
//   onSelection: feedback => { // Action script onSelection event | (Optional)
//     console.log(feedback)
//   }
// })
