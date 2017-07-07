import React, { Component } from 'react'
import mori from 'mori'

// -----------------------------------------------------------------------------
// Mori Component
// -----------------------------------------------------------------------------

// a MoriComponent receives a JavaScript Object with one key: imdata
// imdata should be a mori structure that supports mori.equals() comparisons
class MoriComponent extends Component {
  // only update the component if the mori data structure is not equal
  shouldComponentUpdate (nextProps, _nextState) {
    return !mori.equals(this.props.imdata, nextProps.imdata)
  }
}

// -----------------------------------------------------------------------------
// Pixel
// -----------------------------------------------------------------------------

function clickPixel (rowIdx, colIdx) {
  console.log(rowIdx, colIdx)
  const currentState = window.CURRENT_STATE
  const currentColor = mori.get(currentState, 'brushColor')
  morilog(currentColor)
  const newState = mori.assocIn(currentState, ['board', rowIdx, colIdx], currentColor)
  window.NEXT_STATE = newState
  morilog(newState)
}

class Pixel extends MoriComponent {
  render () {
    const color = mori.get(this.props.imdata, 'color')
    const rowIdx = mori.get(this.props.imdata, 'rowIdx')
    const colIdx = mori.get(this.props.imdata, 'colIdx')
    let className = 'square'

    const clickFn = mori.partial(clickPixel, rowIdx, colIdx)
    function mouseEnter () {
      // do nothing if the mouse is not pressed
      if (!window.IS_PRESSED_DOWN) return
      clickPixel(rowIdx, colIdx)
    }

    const pixelStyle = {
      backgroundColor: color
    }

    return (
      <div className={className} onClick={clickFn} onMouseEnter={mouseEnter} style={pixelStyle} />
    )
  }
}

// -----------------------------------------------------------------------------
// Board
// -----------------------------------------------------------------------------

class Row extends MoriComponent {
  render () {
    const colVec = mori.get(this.props.imdata, 'cols')
    const numCols = mori.count(colVec)
    const rowIdx = mori.get(this.props.imdata, 'rowIdx')

    let squares = []
    for (let colIdx = 0; colIdx < numCols; colIdx++) {
      let color = mori.get(colVec, colIdx)
      let pixelData = mori.hashMap('rowIdx', rowIdx, 'colIdx', colIdx, 'color', color)
      let key = 'pixel-' + rowIdx + '-' + colIdx

      squares.push(<Pixel imdata={pixelData} key={key} />)
    }

    return (
      <div className='row'>{squares}</div>
    )
  }
}

function clickColorBtn (newColor) {
  const currentState = window.CURRENT_STATE
  const newState = mori.assoc(currentState, 'brushColor', newColor)
  window.NEXT_STATE = newState
}

function ColorPickerButton (color) {
  return <button onClick={clickColorBtn.bind(null, color)} className={color}></button>
}

function morilog (cljThing) {
  console.log(mori.toJs(cljThing))
}

class ColorPicker extends MoriComponent {
  render () {
    const colorsVec = this.props.imdata
    const numColors = mori.count(colorsVec)

    let colorButtons = []
    for (let i = 0; i < numColors; i++) {
      let color = mori.get(colorsVec, i)
      colorButtons.push(ColorPickerButton(color))
    }
    return (
      <div className='colors'>{colorButtons} </div>
    )
  }
}

function clickResetBtn () {
  window.NEXT_STATE = mori.hashMap('board', window.EMPTY_BOARD)
}

function App (props) {
  const boardVec = mori.get(props.imdata, 'board')
  const numRows = mori.count(boardVec)

  let rows = []
  for (let rowIdx = 0; rowIdx < numRows; rowIdx++) {
    let colVec = mori.get(boardVec, rowIdx)
    let rowData = mori.hashMap('cols', colVec, 'rowIdx', rowIdx)
    let key = 'row-' + rowIdx

    rows.push(<Row imdata={rowData} key={key} />)
  }

  const colorsVec = mori.get(props.imdata, 'colors')

  return (
    <div className='app-container'>
      <h1>Ashleigh's Paint App </h1>
      <div className='board'>{rows}</div>
      <div className='colors-container'>
        <ColorPicker imdata={colorsVec} />
      </div>
      <button onClick={clickResetBtn}>Undo</button>
    </div>
  )
}

export default App
