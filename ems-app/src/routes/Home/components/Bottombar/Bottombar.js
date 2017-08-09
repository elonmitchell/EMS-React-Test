import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation'
import AppBar from 'material-ui/AppBar'
import Paper from 'material-ui/Paper'
import FontIcon from 'material-ui/FontIcon'
import FlatButton from 'material-ui/FlatButton'
import { connect } from 'react-redux'
import {
  firebaseConnect,
  pathToJS,
  dataToJS,
  isEmpty
} from 'react-redux-firebase'
import { LIST_PATH, ACCOUNT_PATH, LOGIN_PATH, SIGNUP_PATH } from 'constants'
import classes from './Bottombar.scss'

export default class Bottombar extends Component {
  constructor(props){
    super(props);
  }

  render () {
    return (
      <Paper zDepth={2} className={classes.wrapper}>
        <FlatButton onTouchTap={()=>{this.props.scrollBookings(0)}} label="Now" primary={true} className={classes.now}/>
      </Paper>
    )
  }
}