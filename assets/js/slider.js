/* eslint-disable no-undef */

class Slider {
  constructor (props) {
    this.rootElement = props.element
    this.slides = Array.from(
      this.rootElement.querySelectorAll('.slider-list__item')
    )
    this.slidesLength = this.slides.length
    this.current = 0
    this.isAnimating = false
    this.direction = 1 // -1
    this.baseAnimeSettings = {
      rotation: 45,
      duration: 350,
      easing: 'easeInOutCirc'
    }

    this.navBar = this.rootElement.querySelector('.slider__nav-bar')
    this.thumbs = Array.from(this.rootElement.querySelectorAll('.nav-control'))
    this.prevButton = this.rootElement.querySelector('.slider__arrow_prev')
    this.nextButton = this.rootElement.querySelector('.slider__arrow_next')

    this.slides[this.current].classList.add('slider-list__item_active')
    this.thumbs[this.current].classList.add('nav-control_active')

    this._bindEvents()
  }

  goTo (index, dir) {
    if (this.isAnimating) return
    const self = this
    const prevSlide = this.slides[this.current]
    const nextSlide = this.slides[index]

    self.isAnimating = true
    self.current = index
    nextSlide.classList.add('slider-list__item_active')

    anime(Object.assign({}, self.baseAnimeSettings, {
      targets: nextSlide,
      translateX: [90 * dir + '%', 0]
    }))

    anime(Object.assign({}, self.baseAnimeSettings, {
      targets: prevSlide,

      translateX: [0, -100 * dir + '%'],
      complete: function (anim) {
        self.isAnimating = false
        prevSlide.classList.remove('slider-list__item_active')
        self.thumbs.forEach((item, index) => {
          const action = index === self.current ? 'add' : 'remove'
          item.classList[action]('nav-control_active')
        })
      }
    }))
  }

  goStep (dir) {
    const index = this.current + dir
    const len = this.slidesLength
    const currentIndex = (index + len) % len
    this.goTo(currentIndex, dir)
  }

  goNext () {
    this.goStep(1)
  }

  goPrev () {
    this.goStep(-1)
  }

  _navClickHandler (e) {
    const self = this
    if (self.isAnimating) return
    const target = e.target.closest('.nav-control')
    if (!target) return
    const index = self.thumbs.indexOf(target)
    if (index === self.current) return
    const direction = index > self.current ? 1 : -1
    self.goTo(index, direction)
  }

  _bindEvents () {
    const self = this;
    ['goNext', 'goPrev', '_navClickHandler'].forEach(method => {
      self[method] = self[method].bind(self)
    })
    self.nextButton.addEventListener('click', self.goNext)
    self.prevButton.addEventListener('click', self.goPrev)
    self.navBar.addEventListener('click', self._navClickHandler)
  }
}

// ===== init ======
const slider = new Slider({
  element: document.querySelector('.slider')
})

class TypeSelector {
  constructor (props) {
    this.rootElement = props.element
    this.baseTypes = Array.from(
      this.rootElement.querySelectorAll('.base-type input')
    )
    this.secondaryType = []
    this.current = 0
    this.isAnimating = false
    this.direction = 1 // -1
    this.baseAnimeSettings = {
      rotation: 45,
      duration: 750,
      easing: 'easeInOutCirc'
    }

    this.navBar = this.rootElement.querySelector('.slider__nav-bar')
    this.thumbs = Array.from(this.rootElement.querySelectorAll('.nav-control'))

    // this.slides[this.current].classList.add('type-active')

    this._bindEvents()
  }

  displaySecondary (base) {
    if (this.isAnimating) return
    const self = this
    let secTypes = []
    if (base === 'bar') secTypes = ['square', 'circle', 'rectangle', 'rebar']
    if (base === 'tubing') secTypes = ['square', 'circle', 'rectangle']
    if (base === 'beam') secTypes = ['t', 'h', 'i', 'channel']
    if (base === 'sheet') secTypes = ['flat', 'corrugated', 'flat', 'rebar']
  }
}
