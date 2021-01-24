const baseTypes = document.querySelectorAll('.base-type input')
const secContainer = document.querySelector('.sec-type')

const typeObj = {
  bar: ['reebar', 'flat', 'square', 'circle'],
  tubing: ['circle', 'square', 'rectangle'],
  beam: ['t-section', 'h-section', 'i-section', 'channel'],
  sheet: ['corrugated', 'flat', 'checker']

}

for (let i = 0; i < baseTypes.length; i++) {
  const baseType = baseTypes[i]

  baseType.addEventListener('click', e => {
    const newTypes = typeObj[baseType.vaue]

    for (let j = 0; j < newTypes.length; j++) {
      const newType = newTypes[j]

      secContainer.innerHTML += `<label class="radio row start">
      <span class="radio-input">
        <input type="radio" name="base" id="${newType}" value="${newType}">
        <span class="radio-control row neu"></span>
      </span>
      <span class="radio-label">${newType.charAt(0).toUpperCase() + newType.slice(1)}</span>
    </label>
  `
    }
  })
}
