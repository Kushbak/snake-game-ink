'use strict';
const React = require('react');
const { Text, Box, } = require('ink');
const useInterval = require('./useInterval');
const { default: StdinContext } = require('ink/build/components/StdinContext');
const importJsx = require('import-jsx')
const EndScreen = importJsx('./EndScreen')

const ARROW_UP = '\u001B[A'
const ARROW_DOWN = '\u001B[B'
const ARROW_LEFT = '\u001B[D'
const ARROW_RIGHT = '\u001B[C'
const FIELD_SIZE = 16
const FIELD_ROW = [...new Array(FIELD_SIZE).keys()]
const DIRECTIONS = {
  LEFT: { x: -1, y: 0, },
  RIGHT: { x: 1, y: 0, },
  TOP: { x: 0, y: -1, },
  BOTTOM: { x: 0, y: 1, },
}

const App = () => {
  const [snakeSegments, setSnakeSegments] = React.useState([
    { x: 8, y: 8 },
    { x: 8, y: 7 },
    { x: 8, y: 6 },
  ])
  const [foodItem, setFoodItem] = React.useState({
    x: Math.floor(Math.random() * FIELD_SIZE),
    y: Math.floor(Math.random() * FIELD_SIZE),
  })
  const [direction, setDirection] = React.useState(DIRECTIONS.LEFT)

  const getItem = (x, y, snakeSegments) => {
    if (foodItem.x === x && foodItem.y === y) {
      return <Text color='red'>🍎</Text>
    }

    for (const segment of snakeSegments) {
      if (segment.x === x && segment.y === y) {
        return <Text color='green'> ◻ </Text>
      }
    }
  }

  const limitByField = (j) => {
    if (j >= FIELD_SIZE) return 0
    if (j < 0) return FIELD_SIZE - 1
    return j
  }

  const newSnakePosition = (segments, direction) => {
    const [head] = segments
    const newHead = {
      x: limitByField(head.x + direction.x),
      y: limitByField(head.y + direction.y),
    }

    if (collidesWithFood(newHead, foodItem)) {
      setFoodItem({
        x: Math.floor(Math.random() * FIELD_SIZE),
        y: Math.floor(Math.random() * FIELD_SIZE),
      })
      return [newHead, ...segments]
    }
    return [newHead, ...segments.slice(0, -1)]
  }

  const collidesWithFood = (head, foodItem) => {
    return head.x === foodItem.x && head.y === foodItem.y
  }

  const [head, ...tail] = snakeSegments
  const intersectWithItself = tail.some(item => item.x === head.x && item.y === head.y)

  useInterval(() => {
    setSnakeSegments(segments => newSnakePosition(segments, direction))
  }, intersectWithItself ? null : 150)

  const { stdin, setRawMode } = React.useContext(StdinContext)

  React.useEffect(() => {
    setRawMode(true)
    stdin.on('data', (data) => {
      const value = data.toString()
      if (value == ARROW_UP) setDirection(DIRECTIONS.TOP)
      if (value == ARROW_DOWN) setDirection(DIRECTIONS.BOTTOM)
      if (value == ARROW_LEFT) setDirection(DIRECTIONS.LEFT)
      if (value == ARROW_RIGHT) setDirection(DIRECTIONS.RIGHT)
    })
  }, [])

  return (
    <Box flexDirection='column' alignItems='center'>
      <Text color="green">Snake game</Text>
      {
        intersectWithItself
          ? <EndScreen size={FIELD_SIZE} />
          : <Box flexDirection='column'>
            {FIELD_ROW.map(itemY => (
              <Box key={itemY}>
                {FIELD_ROW.map(itemX => (
                  <Box key={itemX}>
                    <Text>{getItem(itemX, itemY, snakeSegments) || ' . '}</Text>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
      }
    </Box>
  )
}

module.exports = App;
