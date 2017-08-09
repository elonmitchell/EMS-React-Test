import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import Drawer from 'material-ui/Drawer'
import AppBar from 'material-ui/AppBar'
import IconMenu from 'material-ui/IconMenu'
import IconButton from 'material-ui/IconButton'
import MenuItem from 'material-ui/MenuItem'
import FlatButton from 'material-ui/FlatButton'
import DownArrow from 'material-ui/svg-icons/hardware/keyboard-arrow-down'
import MenuIcon from 'material-ui/svg-icons/navigation/menu'
import ContentAdd from 'material-ui/svg-icons/content/add'
import ActionSearch from 'material-ui/svg-icons/action/search'
import Avatar from 'material-ui/Avatar'
import Dialog from 'material-ui/Dialog'
import TextField from 'material-ui/TextField'
import DatePicker from 'material-ui/DatePicker'
import TimePicker from 'material-ui/TimePicker'
import SearchBar from 'material-ui-search-bar'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import Calendar from 'rc-calendar'
import moment from 'moment'
import * as _ from 'lodash'

import {
	firebaseConnect,
	pathToJS,
	dataToJS,
	isLoaded,
	isEmpty,
} from 'react-redux-firebase'
import { LIST_PATH, ACCOUNT_PATH, LOGIN_PATH, SIGNUP_PATH } from 'constants'
import defaultUserImage from 'static/User.png'
import Theme from 'theme'
import classes from './Navbar.scss'

const buttonStyle = {
	color: 'white',
	textDecoration: 'none',
	alignSelf: 'center'
}

const iconStyle = {
	width: 28,
	height: 28,
}

@firebaseConnect([
  { path: '/bookings' }
])
@connect(({ firebase }) => ({
  bookings: dataToJS(firebase, 'bookings')
}))

export default class Navbar extends Component {

	static contextTypes = {
		router: PropTypes.object.isRequired
	}

  static propTypes = {
    bookings: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array
    ]),
    firebase: PropTypes.shape({
      push: PropTypes.func.isRequired,
      database: PropTypes.oneOfType([PropTypes.object, PropTypes.func])
    }),
  }

	constructor(props){
		super(props);
		this.state = {
			selectedDate: new Date(),
			isOpenMenu: false,
			isOpenDialog: false,
			zIndex: 0,
			eventName: '',
			roomName: '',
			scrollPoints: [],
			startDate: new Date(),
			startTime: new Date(),
			endDate: moment(new Date()).add(30, 'm').toDate(),
			endTime: moment(new Date()).add(30, 'm').toDate()
		};
	}

	render () {
		const { account, auth, bookings } = this.props
		const authExists = isLoaded(auth) && !isEmpty(auth)

		const leftMenu = (
			<div>
				<IconButton onTouchTap={this.toggleMenu} iconStyle={iconStyle}><MenuIcon color={'#4A85E8'} /></IconButton>
				<DatePicker hintText={ moment(this.state.selectedDate).format('MMMM YYYY') } onChange={this.setDate} container="inline" className={classes.datepicker}/>
			</div>
		)
		const actions = [
			<FlatButton
				label="Cancel"
				primary={true}
				onTouchTap={this.closeDialog}
			/>,
			<FlatButton
				label="Submit"
				primary={true}
				onTouchTap={this.submitBooking}
			/>,
		];
		const rightMenu = (
			<div>
				<IconButton onTouchTap={this.openSearch} iconStyle={iconStyle}><ActionSearch color={'#4A85E8'} /></IconButton>
				<IconButton onTouchTap={this.openDialog} iconStyle={iconStyle}><ContentAdd color={'#4A85E8'} /></IconButton>
				<Dialog
					title="New booking"
					actions={actions}
					modal={false}
					open={this.state.isOpenDialog}
					onRequestClose={this.closeDialog}
				>
					<TextField
						value={this.state.eventName}
						floatingLabelText="Event Name"
						fullWidth={true}
						onChange={this.handleChangeEventName}
					/><br />
					<TextField
						value={this.state.roomName}
						floatingLabelText="Room Name"
						fullWidth={true}
						onChange={this.handleChangeRoomName}
					/><br /><br />
					<DatePicker value={this.state.startDate} hintText="Start Date" className={classes.fullwidth} onChange={this.handleChangeStartDate} />
					<TimePicker value={this.state.startTime} format="24hr" hintText="Start Time" className={classes.fullwidth} onChange={this.handleChangeStartTime} />
					<br />
					<DatePicker value={this.state.endDate} hintText="End Date" className={classes.fullwidth} onChange={this.handleChangeEndDate} />
					<TimePicker value={this.state.endTime} format="24hr" hintText="End Time" className={classes.fullwidth} onChange={this.handleChangeEndTime} />
					<br />
				</Dialog>
			</div>
		)

		return (
			<div>
				<AppBar
					iconElementLeft={leftMenu}
					iconElementRight={rightMenu}
					className={classes.appBar}
					style={{backgroundColor: '#f5f5f5', boxShadow: 'none'}}
				/>
				<SearchBar
          searchIcon={<CloseIcon color={Theme.palette.primary2Color} />}
					onChange={this.onChangeText}
					onRequestSearch={this.closeSearch}
					className={classes.searchbar}
          style={{
            height:'64px', 
            position:'absolute',
            width: '100%',
            top: 0,
            zIndex: this.state.zIndex
          }}
				/>
			</div>
		)
	}

	setDate = (e, date) => {
		this.setState({ selectedDate: date });
		this.props.scrollBookings(moment(date).format('MM-DD-YYYY'));
	}

	openDialog = () => {
    this.setState({isOpenDialog: true})
  }

	closeDialog = () => {
    this.setState({isOpenDialog: false})
  }

	openSearch = () => {
		this.setState({zIndex: 1200})
	}

  closeSearch = () => {
    this.setState({zIndex: 0})
  }

	onChangeText = (text) => {
		this.props.onChangeSearchKey(text)
	}

	submitBooking = () => {
		if (this.state.eventName && this.state.roomName && 
				this.state.startDate && this.state.startTime && 
				this.state.endDate && this.state.endTime) {

					let start = moment(this.state.startDate).format('YYYY-MM-DDT') + moment(this.state.startTime).format('hh:mm:ss.000Z')
					let end = moment(this.state.endDate).format('YYYY-MM-DDT') + moment(this.state.endTime).format('hh:mm:ss.000Z')
					const newBooking = {
						eventName: this.state.eventName,
						roomName: this.state.roomName,
						start: start,
						end: end
					}
					this.handleAddBooking(newBooking)
			    this.setState({isOpenDialog: false, scrollPoints: []})

		}
	}

	handleChangeEventName = (e, text) => {
		this.setState({eventName: text})
	}

	handleChangeRoomName = (e, text) => {
		this.setState({roomName: text})
	}

	handleChangeStartDate = (e, date) => {
		this.setState({startDate: date})
	}

	handleChangeStartTime = (e, date) => {
		this.setState({startTime: date})
	}

	handleChangeEndDate = (e, date) => {
		this.setState({endDate: date})
	}

	handleChangeEndTime = (e, date) => {
		this.setState({endTime: date})
	}

	handleAddBooking = (newBooking) => {
		const { bookings, firebase } = this.props
		let lastObj = _.last(_.sortBy(bookings, ['id']))
		newBooking.id = lastObj ? lastObj.id + 1 : 1
		return firebase.push('/bookings', newBooking)
	}
}
