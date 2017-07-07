import ReactDOM from 'react-dom'
import App from './App'
import mori from 'mori'
import './index.css'

// -----------------------------------------------------------------------------
// Application State
// -----------------------------------------------------------------------------

const numRows = 50
const numCols = 80

function createEmptyBoard () {
  var board = []
  for (let i = 0; i < numRows; i++) {
    board[i] = []

    for (let j = 0; j < numCols; j++) {
      board[i][j] = false
    }
  }

  return board
}

window.EMPTY_BOARD = mori.toClj(createEmptyBoard())
const colors = mori.vector('black', 'red', 'yellow', 'purple', 'blue', 'green')

const initialState = {
  board: window.EMPTY_BOARD,
  colors: colors,
  brushColor: mori.first(colors),
}

// CURRENT_STATE is always the current state of the application
window.CURRENT_STATE = null

// NEXT_STATE is the next state the application should be in
// Start it off with a PDS version of our initialState object.
window.NEXT_STATE = mori.toClj(initialState)
window.IS_PRESSED_DOWN = false

let renderCount = 0

// You can track each application state using a mori vector.
// window.HISTORY = mori.vec()

// -----------------------------------------------------------------------------
// Render Loop
// -----------------------------------------------------------------------------

const rootEl = document.getElementById('root')

// constantly render on every requestAnimationFrame
function render () {
  // Only trigger a render if CURRENT_STATE and NEXT_STATE are different.
  // NOTE: checking deep equality of a persistent data structure is a fast and
  //       cheap operation, even for large data structures
  if (!mori.equals(window.CURRENT_STATE, window.NEXT_STATE)) {
    // do not perform the update if NEXT_STATE is not valid
    if (!isValidState(window.NEXT_STATE)) {
      console.warn('Oops! Tried to set an invalid NEXT_STATE')
      window.NEXT_STATE = window.CURRENT_STATE
    } else {
      // next state is now our current state
      window.CURRENT_STATE = window.NEXT_STATE

      // you might add this new state to your history vector here...
      // window.HISTORY = mori.conj(window.HISTORY, window.CURRENT_STATE)

      ReactDOM.render(App({imdata: window.CURRENT_STATE}), rootEl)

      renderCount = renderCount + 1
      // console.log('Render #' + renderCount)
    }
  }

  window.requestAnimationFrame(render)
}

window.requestAnimationFrame(render)

// this is a sanity-check function so you can ensure your state is valid
function isValidState (state) {
  return mori.isMap(state) &&
         mori.isVector(mori.get(state, 'board'))
         // TODO: add more conditions here as appropriate
}

// -----------------------------------------------------------------------------
// Native Events
// -----------------------------------------------------------------------------

// NOTE: these events do not participate in React.js synthetic event system

function addEvents () {
  document.body.addEventListener('mousedown', onMouseDown)
  document.body.addEventListener('mouseup', onMouseUp)
}

addEvents()

function onMouseDown (evt) {
  window.IS_PRESSED_DOWN = true
  console.log('MOUSE DOWN' + window.IS_PRESSED_DOWN)
}

function onMouseUp (evt) {
  window.IS_PRESSED_DOWN = false
  console.log('MOUSE UP' + window.IS_PRESSED_DOWN)
}
