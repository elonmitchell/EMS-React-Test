import React, { Component, PropTypes } from 'react'
import { List, ListItem } from 'material-ui/list'
import Subheader from 'material-ui/Subheader'
import preciseDiff from 'moment-precise-range-plugin'
import * as _ from 'lodash'
import moment from 'moment'

import classes from './Bookings.scss'

function isToday(date) {
	return moment().format('YYYY-MM-DD') === moment(date).format('YYYY-MM-DD')
}

function shortify(precised) {
	let str = precised.replace(' hours', 'h')
	str = str.replace(' hour', 'h')
	const index = str.search(' minute')
	if (index > 0) {
		str = str.substring(0, index) + 'm'
	}
	return str
}
/**
 * 
 * @param {Object[]} bookings 
 * @return {Object[]} sorted and grouped bookings for displaying on view
 */
function groupBookings(bookings) {
	let groupList = {}, sortedGroups = []
	if (bookings) {
		_.map(bookings, (booking) => {
			if (booking) {
				const date = moment(booking.start).format('YYYY-MM-DD')
				if (!groupList[date]) {
					groupList[date] = []
				}
				groupList[date].push(booking)
			}
		})
		groupList = _.map(groupList, (group) => {
			if (group && group.length > 1) {
				return _.sortBy(group, ['start'])
			} else {
				return group
			}
		})
		groupList = groupList.sort((a, b) => {
			return moment(a[0].start).diff(moment(b[0].start))
		})
		console.log(groupList)
		for (let index = 0; index < groupList.length; index++) {
			let element = groupList[index]
			console.log(moment(element[0].start).format('ddd MMM D'))
			if (index === 0) {
				sortedGroups.push(Object.assign(element))
			} else {
				let prev = groupList[index-1]
				let diffDays = moment(element[0].start).diff(moment(prev[0].start), 'days')
				if (diffDays > 1) {
					if (diffDays === 2) {
						sortedGroups.push(moment(prev[0].start).add(1, 'day').format('ddd MMM D'))
					} else {
						sortedGroups.push(`${moment(prev[0].start).add(1, 'day').format('MM-DD-YYYY')},${moment(prev[0].start).add(diffDays-1, 'days').format('MM-DD-YYYY')}`)
					}
				}
				sortedGroups.push(Object.assign(element))
			}
		}
	}
	console.log('sortedGroups:', sortedGroups)
	return sortedGroups
}

function renderListItem(group, index) {
	if (group) {
		if(typeof group === 'string') {
			let dates = group.split(',');
			return (
				<div className="scheduleday" key={ index } data-dates={[dates[0],dates[1]]}>
					<Subheader className={classes.subheader}>{ moment(dates[0]).format('ddd MMM D YYYY') + ' - ' +  moment(dates[1]).format('ddd MMM D YYYY') }</Subheader>
					<ListItem
						key={ 'empty_'+index }
						className={classes.listitem}
						secondaryText={
							<table>
								<tbody>
									<tr><td>You have no bookings for these dates.</td><td></td></tr>
								</tbody>
							</table>
						}
					/>
				</div>
			)
		}
		else if(typeof group === 'object'){
			return (
				<div className="scheduleday" data-dates={[moment(group[0].start).format('MM-DD-YYYY'),moment(group[0].end).format('MM-DD-YYYY')]} key={ index }>
					<Subheader className={classes.subheader}>
						{ isToday(group[0].start) ? 'TODAY ' : ' ' }
						{ moment(group[0].start).format('ddd MMM D YYYY') }
					</Subheader>
					{ _.map(group, (booking) => 
						<ListItem
							key={ 'booking_'+booking.id }
							className={classes.listitem}
							secondaryText={
								<table>
									<tbody>
										<tr><td>{ moment(booking.start).format('h:mm A') }</td><td>{ booking.eventName }</td></tr>
										<tr><td>{ moment(booking.end).format('h:mm A') }</td><td>{ booking.roomName }</td></tr>
										<tr><td>{ shortify(moment(booking.start).preciseDiff(booking.end)) }</td><td></td></tr>
									</tbody>
								</table>
							}
						/>
					)}
				</div>
			)
		}
	}
}
export default class Bookings extends Component {
	// static propTypes = {
		// bookings: PropTypes.object.isRequired,
	// }
	render() {
		const { bookings } = this.props
		console.log('read bookings: ', bookings)
		const groupedBookings = groupBookings(bookings).reverse()
		console.log('sorted and grouped bookings', groupedBookings)
		return (
			<div className={classes.container}>
				<List style={{ padding: 0 }}>
					{ groupedBookings && _.map(groupedBookings, renderListItem) }
				</List>
			</div>
		)
	}
}