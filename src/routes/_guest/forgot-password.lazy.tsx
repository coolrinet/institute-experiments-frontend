import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_guest/forgot-password')({
  component: () => <div>Hello /_guest/forgot-password!</div>
})