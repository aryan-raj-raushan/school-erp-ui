import React from 'react'


const Container = ({children}: {children: React.ReactNode}) => {
  return (
    <div className='container mx-auto px-6 py-2'>{children}</div>
  )
}

export default Container