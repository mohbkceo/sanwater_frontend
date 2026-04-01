import React from 'react'

function Header({title, discription}) {
  return (
    <div className="flex flex-col gap-4 mb-10">
          <h1 className="text-4xl md:text-5xl font-mainFont bg-linear-to-b from-gray-700 to-gray-900 bg-clip-text text-transparent ">
            {title}
          </h1>

          <p className="text-black/80 font-mono max-w-xl">
            {discription}
          </p>
    </div>

  )
}

export default Header