const baseTypes = document.querySelectorAll('.base-type input')
const secContainer = document.querySelector('.sec-type')
const prevImg = document.querySelector('.preview-img')
const formData = new FormData()
const form = document.querySelector('#post-form')
const imagesInput = document.querySelector('#images')
const materials = ['stainless', 'tool', 'carbon', 'alloy', 'other']
// var citiesJson  = require('./za.json');

function getData () {
  return fetch('/geojson/cities')
    .then(response => response.json())
    .then(data => { return data })
}

// var select = document.getElementById("suburb-post");

// console.log(citiesJson[1].city)

// for(var i = 0; i < citiesJson.length; i++) {
//   var opt = citiesJson[i].city;
//   select.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
// }

(async () => {
  const citiesData = await getData()

  const provinceSelect = document.querySelector('#province-select')
  let citiesSelect = '<select name="cities-select" id="cities-select">'

  provinceSelect.addEventListener('change', e => {
    citiesData.forEach(el => {
      if (el.admin_name === e.target.value) {
        citiesSelect += '<option value=' + el.city + '>' + el.city + '</option>'
      // provinceSelect.insertAdjacentHTML('afterend',)
      }
    })
    citiesSelect += '</select>'
    provinceSelect.insertAdjacentHTML('afterend', citiesSelect)
  })
})()

const select = document.getElementById('selectNumber')
const options2 = ['1', '2', '3', '4', '5']

for (let i = 0; i < options2.length; i++) {
  const opt = options2[i]

  const el = document.createElement('option')
  el.text = opt
  el.value = opt

  select.add(el)
}

// validation
const options = {
  errorClassName: 'error',
  // set a custom rule
  rules: {
    material: function (value) {
      if (materials.indexOf(value) === -1) {
        return false
      }
      return true
    }

  },

  // set a incorrect message text
  messages: {
    en: {
      material: {
        incorrect: 'A material must be selected'
      }
    }
  }
}

const validator = new Validator(form, function (err, res) {
  return res
}, options)

const date = document.querySelector('#date')

date.value = new Date().toISOString().slice(0, 10)

form.addEventListener('submit', e => {
  e.preventDefault()
  if (validator.validate() === true) {
    formData.append('title', document.querySelector('#title').value)
    formData.append('price', document.querySelector('#price').value)
    formData.append('quantity', document.querySelector('#quantity').value)
    formData.append('material', document.querySelector('#material').value)
    formData.append('description', document.querySelector('#description').value)
    formData.append('location', document.querySelector('#location').value)
    formData.append('date', new Date().toISOString().slice(0, 10))
    formData.append('type', document.querySelector('#type').value)

    const uploadLocation = 'http://localhost:3000/newListing'

    const ajax = new XMLHttpRequest()
    ajax.open('POST', uploadLocation, true)

    ajax.onreadystatechange = function (e) {
      if (ajax.readyState === 4) {
        if (ajax.status === 200) {
          window.location.replace(ajax.responseURL)
        } else {
          // error!
        }
      }
    }
    ajax.send(formData)
  } else {

  }
})

const typeObj = {
  bar: ['square', 'flat', 'reebar', 'circle'],
  tubing: ['square', 'circle', 'rectangle'],
  beam: ['t-section', 'h-section', 'i-section', 'channel', 'angled'],
  sheet: ['corrugated', 'flat', 'checkered', 'perforated'],
  mesh: ['expanded', 'welded', 'woven']

}
const typeInput = document.querySelector('#type')

for (let i = 0; i < baseTypes.length; i++) {
  const baseType = baseTypes[i]

  baseType.addEventListener('click', e => {
    secContainer.innerHTML = ''
    const newTypes = typeObj[baseType.value]
    prevImg.setAttribute('data', '/images/types/' + baseType.value + '-' + newTypes[0] + '.svg')
    // typeInput.value = baseType.value + '-' + typeInput.value.split('-')[1]
    typeInput.value = baseType.value

    for (let j = 0; j < newTypes.length; j++) {
      const newType = newTypes[j]

      secContainer.innerHTML += `<label class="radio row start">
      <span class="radio-input">
        <input type="radio" name="sec" id="${newType}" value="${newType}">
        <span class="radio-control row neu"></span>
      </span>
      <span class="radio-label">${newType.charAt(0).toUpperCase() + newType.slice(1)}</span>
    </label>`
      const secChecks = document.querySelectorAll('.sec-type input')

      for (let k = 0; k < secChecks.length; k++) {
        const secCheck = secChecks[k]
        secCheck.addEventListener('click', e => {
          typeInput.value = baseType.value + '-' + secCheck.value
          prevImg.setAttribute('data', '/images/types/' + baseType.value + '-' + secCheck.value + '.svg')
        })
      }
    }
  })
}

// const provider = new GeoSearch.OpenStreetMapProvider({
//   params: {
//     // https://nominatim.org/release-docs/develop/api/Search/#parameters
//     countrycodes: 'za', limit: 5, polygon_svg: 1, format: 'json'
//   }
// })

// function getData () {
//   return fetch('https://s.fleet.ls.hereapi.com/1/static.json?region=ZAF&content=TC_VEH_TYPES&apiKey=FrD2J3pgZLqZmUnKW4fFopO6s0FuXBftiDabM_p4qto')
//     .then(response => response.json())
//     .then(data => { return data })
// }

// const params = {
//   apiKey: 'FrD2J3pgZLqZmUnKW4fFopO6s0FuXBftiDabM_p4qto',
//   limit: 100,
//   region: 'ZAF'
//   // in: 'countryCode:ZAF'

// }
// const provider = new GeoSearch.HereProvider({
//   params: params,
//   searchUrl: 'https://s.fleet.ls.hereapi.com/static.json',
//   reverseUrl: 'https://fleet.ls.hereapi.com/static.json'
// })

const resultList = document.querySelector('.results')

// const autoCompleteGeo = new autoComplete({
//   name: 'locations',
//   selector: '#autoCompleteGeo',
//   observer: false,
//   data: {
//     src: async () => {
//       // Loading placeholder text
//       document
//         .querySelector('#autoCompleteGeo')
//         .setAttribute('placeholder', 'Loading...')
//       // Fetch External Data Source
//       const query = document.querySelector('#autoCompleteGeo').value
//       // Fetch External Data Source
//       // const data = await provider.search({ content: 'TC_VEH_TYPES' })
//       const data = await getData()
//       // Saves the fetched data into local storage
//       localStorage.setItem('acData', JSON.stringify(data))
//       // Retrieve the cached data from local storage
//       const localData = JSON.parse(localStorage.getItem('acData'))
//       // Post loading placeholder text
//       document
//         .querySelector('#autoCompleteGeo')
//         .setAttribute('placeholder', autoCompleteJS.placeHolder)
//       // Returns Fetched data
//       return localData
//     },
//     key: ['label'],
//     results: (list) => {
//       // Filter duplicates
//       const filteredResults = Array.from(
//         new Set(list.map((value) => value.match))
//       ).map((val2) => {
//         return list.find((value) => value.match === val2)
//       })

//       return filteredResults
//     }
//   },
//   trigger: {
//     event: ['input', 'focus']
//   },
//   placeHolder: 'Search',
//   searchEngine: 'strict',
//   highlight: true,
//   maxResults: 5,
//   threshold: 3,
//   debounce: 300,
//   resultsList: {
//     destination: '#location',
//     container: (source) => {
//       source.classList.add('neu-static')
//       source.classList.add('bg-color')
//     }
//   },
//   resultItem: {
//     content: (data, element) => {
//       // Prepare Value's Key
//       const key = Object.keys(data.value).find(
//         (key) => data.value[key] === element.innerText
//       )
//       element.classList.add('row')
//       element.classList.add('between')
//       element.classList.add('neu')

//       // Modify Results Item
//       // element.style = 'display: flex; justify-content: space-between;'
//       element.innerHTML = `<span>
//         ${element.innerHTML}</span>
//         <span style="display: flex; align-items: center; font-size: 13px; font-weight: 100; text-transform: uppercase;">
//       ${key}</span>`
//     }
//   },
//   noResults: (dataFeedback, generateList) => {
//     // Generate autoComplete List
//     generateList(autoCompleteJS, dataFeedback, dataFeedback.results)
//     // No Results List Item
//     const result = document.createElement('li')
//     result.setAttribute('class', 'no_result')
//     result.setAttribute('tabindex', '1')
//     result.innerHTML = `<span style="display: flex; align-items: center; font-weight: 100; color: rgba(0,0,0,.2);">Found No Results for "${dataFeedback.query}"</span>`
//     document
//       .querySelector(`#${autoCompleteJS.resultsList.idName}`)
//       .appendChild(result)
//   },
//   onSelection: (feedback) => {
//     document.querySelector('#autoCompleteGeo').blur()
//     // Prepare User's Selected Value
//     const selection = feedback.selection.value[feedback.selection.key]
//     // Render selected choice to selection div
//     // document.querySelector('.selection').innerHTML = selection
//     // Replace Input value with the selected value
//     document.querySelector('#autoCompleteGeo').value = selection
//     // Console log autoComplete data feedback
//     console.log(feedback)
//   }
// })

function preventDefault (e) {
  e.preventDefault()
  e.stopPropagation()
}

function detectDragDrop () {
  const div = document.createElement('div')
  return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)
}

// change the message
const dragSupported = detectDragDrop()
if (!dragSupported) {
  document.getElementsByClassName('drop-message')[0].innerHTML = 'Click to upload'
}

const // where files are dropped + file selector is opened
  dropRegion = document.getElementById('drop-region')
// where images are previewed
const imagePreviewRegion = document.getElementById('image-preview')

// open file selector when clicked on the drop region
// const fakeInput = document.createElement('input')
// fakeInput.type = 'file'
// fakeInput.accept = 'image/*'
// fakeInput.multiple = true
dropRegion.addEventListener('click', function () {
  imagesInput.click()
})

imagesInput.addEventListener('change', function () {
  const files = imagesInput.files
  handleFiles(files)
})
dropRegion.addEventListener('dragenter', preventDefault, false)
dropRegion.addEventListener('dragleave', preventDefault, false)
dropRegion.addEventListener('dragover', preventDefault, false)
dropRegion.addEventListener('drop', preventDefault, false)

function handleDrop (e) {
  const dt = e.dataTransfer
  const files = dt.files

  if (files.length) {
    handleFiles(files)
  } else {
    // check for img
    const html = dt.getData('text/html')
    const match = html && /\bsrc="?([^"\s]+)"?\s*/.exec(html)
    const url = match && match[1]

    if (url) {
      uploadImageFromURL(url)
    }
  }

  function uploadImageFromURL (url) {
    const img = new Image()
    const c = document.createElement('canvas')
    const ctx = c.getContext('2d')

    img.onload = function () {
      c.width = this.naturalWidth // update canvas size to match image
      c.height = this.naturalHeight
      ctx.drawImage(this, 0, 0) // draw in image
      c.toBlob(function (blob) { // get content as PNG blob
        // call our main function
        handleFiles([blob])
      }, 'image/png')
    }
    img.onerror = function () {
      alert('Error in uploading')
    }
    img.crossOrigin = '' // if from different origin
    img.src = url
  }
}

dropRegion.addEventListener('drop', handleDrop, false)

function handleFiles (files) {
  for (let i = 0, len = files.length; i < len; i++) {
    if (validateImage(files[i])) { previewAddToForm(files[i]) }
  }
}

function validateImage (image) {
  // check the type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (validTypes.indexOf(image.type) === -1) {
    // alert('Invalid File Type')
    return false
  }

  // check the size
  const maxSizeInBytes = 5e6 // 5MB
  if (image.size > maxSizeInBytes) {
    // alert('File too large')
    return false
  }

  return true
}

function previewAddToForm (image) {
  // container
  const imgView = document.createElement('div')
  imgView.className = 'image-view'
  imagePreviewRegion.appendChild(imgView)

  // previewing image
  const img = document.createElement('img')
  imgView.appendChild(img)

  // progress overlay
  const overlay = document.createElement('div')
  overlay.className = 'overlay'
  imgView.appendChild(overlay)

  // read the image...
  const reader = new FileReader()
  reader.onload = function (e) {
    img.src = e.target.result
  }
  reader.readAsDataURL(image)

  // add FormData
  // imagesInput.files.push(image)

  formData.append('images', image)
}
