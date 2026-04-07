import React, { useState } from 'react'
import { Button } from '..'

function EmailSubscribe() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const validateEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    setError('')
    setSuccess(false)

    if (!email) {
      setError('Veuillez entrer votre email.')
      return
    }

    if (!validateEmail(email)) {
      setError('Email invalide.')
      return
    }

    
    console.log('Subscribed:', email)

    setSuccess(true)
    setEmail('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md"
    >
      <div className="flex items-center gap-2">
        <input
          type="email"
          placeholder="Entrez votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1  px-4 py-2 border text-black font-mono bg-white/20 border-gray-300 rounded-md focus:outline-none "
        />

        <Button type="submit">
          S'abonner
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-500 mt-2">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-green-200 mt-2">
          Inscription réussie !
        </p>
      )}
    </form>
  )
}

export default EmailSubscribe