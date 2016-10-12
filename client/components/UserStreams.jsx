import React from 'react';
import {Link} from 'react-router';
import urlUtil from '../utils/urlHelper.jsx';
import { Button, Modal } from 'react-materialize';
import checkLength from '../utils/lengthHelper.jsx';

const UserStreams = ({streams, deleteStream, onStreamSelect, onRequestClose, editStream}) => {
	return (
		<div>
			{ streams.map((stream) => {
				return (
					<ul key={stream.id} className="collection with-header col s12">
						<li className="collection-header">
							<h5 className="card-title">{ stream.title }</h5>
							<p>{ stream.description }</p>
						</li>
						<li className="collection-item">
							<table>
								<tbody>
									<tr>
										<td><Link to={ localStorage.username + '/' + urlUtil.slugify(stream.title) }>Start Streaming</Link></td>
										<td><Modal
										  header='Modal Header'
										  trigger={
										    <a>Edit Stream</a>
										  }>
										  <div>
										  	<form onSubmit={ (e) => { editStream(e, stream) } }>
										  		<input type='text' defaultValue={ stream.title } name='title' />
										  		<input type='text' defaultValue={ stream.description } name='description' />
										  		<input type='submit' value='Submit' className='btn' />
										  	</form>
										  </div>
										</Modal></td>
										<td><a onClick={ () => { deleteStream(stream); } }>Delete Stream</a></td>
										<td><i className="material-icons">supervisor_account</i><br/>{ stream.subscriberCount }</td>
									</tr>
								</tbody>
							</table>
						</li>
					</ul>
				)
			})}
			<div>
				<Link to='/create' className="btn">
					Create New Stream
				</Link>
			</div>
		</div>
	)
}

export default UserStreams;