const baseTypes = document.querySelectorAll('.base-type input')
const secContainer = document.querySelector('.sec-type')
const prevImg = document.querySelector('.preview-img')

const typeObj = {
  bar: ['square', 'flat', 'reebar', 'circle'],
  tubing: ['square', 'circle', 'rectangle'],
  beam: ['t-section', 'h-section', 'i-section', 'channel', 'angled'],
  sheet: ['corrugated', 'flat', 'checkered', 'perforated'],
  mesh: ['expanded', 'welded', 'woven']

}

for (let i = 0; i < baseTypes.length; i++) {
  const baseType = baseTypes[i]

  baseType.addEventListener('click', e => {
    secContainer.innerHTML = ''
    const newTypes = typeObj[baseType.value]
    prevImg.setAttribute('data', '/images/types/' + baseType.value + '-' + newTypes[0] + '.svg')

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
          prevImg.setAttribute('data', '/images/types/' + baseType.value + '-' + secCheck.value + '.svg')
        })
      }
    }
  })
}

const input = document.querySelector('.autocomplete')
const provider = new GeoSearch.OpenStreetMapProvider()

input.addEventListener('keyup', (event) => {
  event.preventDefault()

  setTimeout(async () => {
    const results = await provider.search({ query: input.value })
    console.log(results)
  }, 300)
})
