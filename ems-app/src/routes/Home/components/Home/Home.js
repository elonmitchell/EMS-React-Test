import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Theme from 'theme'
import { Link } from 'react-router'
import { List } from 'material-ui/List'
import Divider from 'material-ui/Divider'
import CircularProgress from 'material-ui/CircularProgress'
import Paper from 'material-ui/Paper'
import {
  firebaseConnect,
  isLoaded,
  pathToJS,
  dataToJS
} from 'react-redux-firebase'
import * as _ from 'lodash'
import { paths } from 'constants'
import classes from './Home.scss'
import Navbar from '../Navbar'
import Bottombar from '../Bottombar'
import Bookings from '../Bookings'
import moment from 'moment'
const authWrapperUrl = 'https://github.com/mjrussell/redux-auth-wrapper'
const reactRouterUrl = 'https://github.com/ReactTraining/react-router'

@firebaseConnect([
  { path: '/bookings' }
])
@connect(({ firebase }) => ({
  bookings: dataToJS(firebase, 'bookings')
}))
export default class Home extends Component {
  static propTypes = {
    bookings: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array
    ]),
    firebase: PropTypes.shape({
      set: PropTypes.func.isRequired,
      remove: PropTypes.func.isRequired,
      push: PropTypes.func.isRequired,
      database: PropTypes.oneOfType([PropTypes.object, PropTypes.func])
    }),
  }

  state = {
    error: null,
    zIndex: 0
  }

  deleteBooking = id => {
    const { bookings, firebase } = this.props
    return firebase.remove(`/bookings/${id}`).catch(err => {
      console.error('Error removing booking: ', err)
      this.setState({ error: 'Error Removing booking' })
      return Promise.reject(err)
    })
  }

  handleAdd = newBooking => {
    newBooking.createdAt = this.props.firebase.database.ServerValue.TIMESTAMP
    return this.props.firebase.push('/bookings', newBooking)
  }

  onChangeSearchKey = (searchKey) => {
    this.setState({searchKey: searchKey})
  }

  searchBookings = (bookings) => {
    const { searchKey } = this.state;
    if (!searchKey || searchKey.trim() == '') {
      return bookings
    } else {
      if (!bookings) return bookings
      const filteredBookings = _.filter(bookings, (booking) => {
        const key = searchKey.toLowerCase()
        return (booking.eventName.toLowerCase().includes(key) || booking.roomName.toLowerCase().includes(key))
      })
      return filteredBookings
    }
  }

  getScrollTop = (date) => {
    let bookingDates = [...document.querySelectorAll('[data-dates]')];

    if(bookingDates){
      let bookingDate = bookingDates.filter((booking,index)=>{
        let dates = booking.getAttribute('data-dates').split(",");
        if(!moment(date).isBefore(dates[0]) && !moment(date).isAfter(dates[1])){
          return booking
        }
      })
      return bookingDate.length ? bookingDate[0].getBoundingClientRect().top : bookingDate;
    }else{
      return;
    }
  }

  scrollBookings = (value) => {
    const scrollArea = document.getElementById('container');
    let topAttr = typeof value === 'number' ? value : this.getScrollTop(value);
    let currentTop = scrollArea.scrollTop;
    if(typeof topAttr === 'number'){
      document.getElementById('container').scrollTop = topAttr ? (topAttr + currentTop) : 0;
    } 
  }

  render() {
    const { bookings } = this.props
    const { error } = this.state
    return (
      <div className={classes.container} style={{ color: Theme.palette.primary2Color }}>
        <Navbar onChangeSearchKey={this.onChangeSearchKey} scrollBookings={this.scrollBookings}/>
        <div id="container" className={classes.bookings}>
          {!isLoaded(bookings)
          ? <CircularProgress style={{ marginTop: 250 }}/>
          : <Bookings bookings={ this.searchBookings(bookings) } />
          }
        </div>
        <Bottombar scrollBookings={this.scrollBookings}/>
      </div>
    )
  }
}