import { type ComponentProps } from "solid-js"

export const Mark = (props: { class?: string }) => {
  return (
    <svg
      data-component="logo-mark"
      classList={{ [props.class ?? ""]: !!props.class }}
      viewBox="0 0 16 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path data-slot="logo-logo-mark-shadow" d="M12 16H4V8H12V16Z" fill="var(--icon-weak-base)" />
      <path data-slot="logo-logo-mark-o" d="M12 4H4V16H12V4ZM16 20H0V0H16V20Z" fill="var(--icon-strong-base)" />
    </svg>
  )
}

export const Splash = (props: Pick<ComponentProps<"svg">, "ref" | "class">) => {
  return (
    <svg
      ref={props.ref}
      data-component="logo-splash"
      classList={{ [props.class ?? ""]: !!props.class }}
      viewBox="0 0 80 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M60 80H20V40H60V80Z" fill="var(--icon-base)" />
      <path d="M60 20H20V80H60V20ZM80 100H0V0H80V100Z" fill="var(--icon-strong-base)" />
    </svg>
  )
}

export const Logo = (props: { class?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 144 42"
      fill="none"
      role="img"
      aria-label="cloud"
      classList={{ [props.class ?? ""]: !!props.class }}
    >
      <g>
        <path d="M24 30H6V18H24V30Z" fill="var(--icon-weak-base)" />
        <path d="M24 12H6V30H24V36H0V6H24V12Z" fill="var(--icon-base)" />

        <path d="M30 6H36V30H54V36H30V6Z" fill="var(--icon-base)" />

        <path d="M78 30H66V18H78V30Z" fill="var(--icon-weak-base)" />
        <path d="M78 12H66V30H78V12ZM84 36H60V6H84V36Z" fill="var(--icon-base)" />

        <path d="M108 30H96V18H108V30Z" fill="var(--icon-weak-base)" />
        <path d="M96 6H90V36H114V6H108V30H96V6Z" fill="var(--icon-base)" />

        <path d="M138 30H126V18H138V30Z" fill="var(--icon-weak-base)" />
        <path d="M138 12H126V30H138V12ZM144 36H120V6H138V0H144V36Z" fill="var(--icon-strong-base)" />
      </g>
    </svg>
  )
}
