import React from 'react'
import PropTypes from 'prop-types'
import classes from './CoreLayout.scss'
import 'styles/core.scss'

export const CoreLayout = ({ children }) => (
  <div className={classes.container}>
    {children}
  </div>
)

CoreLayout.propTypes = {
  children: PropTypes.element.isRequired
}

export default CoreLayout
