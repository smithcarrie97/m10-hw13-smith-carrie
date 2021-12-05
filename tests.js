const head = document.querySelector('head')
const body = document.querySelector('body')

// mocha CSS link
const mochaCSSPath = "https://cdnjs.cloudflare.com/ajax/libs/mocha/8.3.2/mocha.min.css"
const mochaCSSLinkEl = document.createElement('link')
mochaCSSLinkEl.rel = 'stylesheet'
mochaCSSLinkEl.href = mochaCSSPath

// custom styles for mocha runner
const mochaStyleEl = document.createElement('style')
mochaStyleEl.innerHTML =
  `body {
    margin: ${getComputedStyle(body).margin} !important;
  }
  #mocha-stats {
    background: white;
  }
  #mocha {
    text-align: left;
    position: absolute;
    top: 48px;
    right: 0;
    color: black;
    padding: 12px 0 48px;
    background: white;
  }
  #mocha-report {
    min-width: 300px;
  }
  #mocha-report h2, #mocha-report h1{
    color: black;
  }`
head.appendChild(mochaStyleEl)
head.appendChild(mochaCSSLinkEl)

// mocha div
const mochaDiv = document.createElement('div')
mochaDiv.id = 'mocha'
body.appendChild(mochaDiv)

// run tests button
const testBtn = document.createElement('button')
testBtn.textContent = "Run Tests"
testBtn.style = "position: absolute; bottom: 50px; right: 50px;"
body.appendChild(testBtn)

const scriptPaths = [
  "https://cdnjs.cloudflare.com/ajax/libs/mocha/8.3.2/mocha.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/chai/4.3.4/chai.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/sinon.js/10.0.1/sinon.min.js",
  // "tests/jsdom.js" // npx browserify _jsdom.js --standalone JSDOM -o jsdom.js
]
const scriptTags = scriptPaths.map(path => {
  const scriptTag = document.createElement('script')
  scriptTag.type = 'text/javascript'
  scriptTag.src = path
  return scriptTag
})

scriptTags.forEach(tag => body.appendChild(tag))

testBtn.onclick = runTests

function runTests() {
  const testTags = document.querySelectorAll('script[data-test]')
  testTags.forEach(testTag => testTag.remove())
  this.remove()

  mocha.setup("bdd");
  const expect = chai.expect;

  describe("Weather Widget Tests", function () {
    let doc
    let win

    const weatherInfo =  {
      "coord": {
        "lon": -82.3248,
        "lat": 29.6516
      },
      "weather": [
        {
          "id": 800,
          "main": "Clear",
          "description": "clear sky",
          "icon": "01n"
        }
      ],
      "base": "stations",
      "main": {
        "temp": 80.56,
        "feels_like": 84.33,
        "temp_min": 78.71,
        "temp_max": 82.6,
        "pressure": 1018,
        "humidity": 73
      },
      "visibility": 10000,
      "wind": {
        "speed": 9.22,
        "deg": 80
      },
      "clouds": {
        "all": 1
      },
      "dt": 1624840993,
      "sys": {
        "type": 2,
        "id": 2039367,
        "country": "US",
        "sunrise": 1624789874,
        "sunset": 1624840404
      },
      "timezone": -14400,
      "id": 4156404,
      "name": "Gainesville",
      "cod": 200
    }
    beforeEach(async function() {
      const fetchStub = sinon.stub(window, 'fetch')
        .resolves({json: sinon.stub().resolves(weatherInfo)})
      document.querySelector('input').value = 'gainesville'
      document.querySelector('button').click()
      expect(fetchStub.called).to.be.true
      expect(fetchStub.firstCall.args[0].includes('gainesville')).to.be.true
      await (() => {
        return new Promise(res => {
          setTimeout(res, 0)
        })
      })();
    })
    afterEach(function() {
      sinon.restore()
    })
    it('should display "Location Not Found" if no location is found', async function() {
      sinon.restore()
      const fetchStub = sinon.stub(window, 'fetch')
        .resolves({json: sinon.stub().resolves({data: {cod: 404}})})
      document.querySelector('input').value = 'banana'
      document.querySelector('button').click()
      expect(fetchStub.called).to.be.true
      expect(fetchStub.firstCall.args[0].includes('banana')).to.be.true
      await (() => {
        return new Promise(res => {
          setTimeout(res, 0)
        })
      })();
      const errorMsgEl = document.querySelector('#weather > h2')
      expect(errorMsgEl.textContent).to.eq('Location not found')
    })
    it('should be titled "Current Weather"', function() {
      const h1 = document.querySelector('h1')
      expect(h1.textContent).to.eq('Current Weather')
    })
    it('should display city', async function() {
      const h2 = document.querySelector('#weather h2')
      expect(h2.textContent).to.eq('Gainesville, US')
    })
    it('should display working map link', async function() {
      const mapLink = document.querySelector('#weather a')
      expect(mapLink.textContent).to.eq('Click to view map')
      expect(mapLink.href).to.eq('https://www.google.com/maps/search/?api=1&query=29.6516,-82.3248')
    })
    it('should display condition icon', async function() {
      const icon = document.querySelector('#weather img')
      expect(icon.src).to.eq('https://openweathermap.org/img/wn/01n@2x.png')
    })
    it('should display condition', async function() {
      const descEl = document.querySelector('#weather > p:nth-child(4)')
      expect(descEl.textContent).to.eq('clear sky')
    })
    it('should display current temp', async function() {
      const currentTempEl = document.querySelector('#weather > p:nth-child(6)')
      expect(currentTempEl.textContent).to.eq('Current: 80.56° F')
    })
    it('should display current "feels like" temp', async function() {
      const currentFeelsTempEl = document.querySelector('#weather > p:nth-child(7)')
      expect(currentFeelsTempEl.textContent).to.eq('Feels like: 84.33° F')
    })
    it('should display updated time', async function() {
      const updatedTimeEl = document.querySelector('#weather > p:nth-child(9)')
      expect(updatedTimeEl.textContent).to.eq('Last updated: 8:43 PM')
    })
  });

  mocha.run();
}