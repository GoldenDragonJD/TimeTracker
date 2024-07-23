import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

export default function Loading() {
  return (
    <div className='Element-container'>
        <FontAwesomeIcon icon={faSpinner} spinPulse className='Element-store'/>
        <FontAwesomeIcon icon={faSpinner} spinPulse className='Element-visits'/>
        <FontAwesomeIcon icon={faSpinner} spinPulse className='Element-visits'/>
        <FontAwesomeIcon icon={faSpinner} spinPulse className='Element-days'/>
    </div>
  )
}
