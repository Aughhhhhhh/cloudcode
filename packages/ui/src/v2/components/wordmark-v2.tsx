import { createUniqueId, type ComponentProps } from "solid-js"

export function WordmarkV2(props: Pick<ComponentProps<"svg">, "class">) {
  const mask = createUniqueId()
  const maskGradient = createUniqueId()

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 720 129"
      fill="none"
      role="img"
      aria-label="cloud"
      classList={{ [props.class ?? ""]: !!props.class }}
    >
      <g opacity="0.6">
        <g mask={`url(#${mask})`}>
          <g opacity="0.16">
            <path
              opacity="0.7"
              d="M212.846 36.4286H157.462V91.7143H212.846V110.143H139V18H212.846V36.4286Z"
              fill="currentColor"
            />
            <path
              opacity="0.7"
              d="M249.462 18H231V110.143H304.846V91.7143H249.462V18Z"
              fill="currentColor"
            />
            <path
              opacity="0.7"
              d="M378.385 36.4286H341.462V91.7143H378.385V36.4286ZM396.846 110.143H323V18H396.846V110.143Z"
              fill="currentColor"
            />
            <path
              opacity="0.7"
              d="M433.462 18H415V110.143H488.846V18H470.385V91.7143H433.462V18Z"
              fill="currentColor"
            />
            <path
              opacity="0.7"
              d="M562.385 36.8571H525.462V92.1429H562.385V36.8571ZM580.846 110.571H507V18.4286H562.385V0H580.846V110.571Z"
              fill="currentColor"
            />
          </g>
        </g>
      </g>
      <defs>
        <mask id={mask} style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="720" height="129">
          <rect width="720" height="129" fill={`url(#${maskGradient})`} />
        </mask>
        <linearGradient id={maskGradient} x1="360" y1="68" x2="360" y2="129" gradientUnits="userSpaceOnUse">
          <stop stop-color="white" stop-opacity="0.7" />
          <stop offset="1" stop-color="white" stop-opacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}
