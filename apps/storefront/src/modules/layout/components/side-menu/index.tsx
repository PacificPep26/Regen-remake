"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import useToggleState from "@lib/hooks/use-toggle-state"
import { ArrowRightMini, BarsThree, XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text, clx } from "@modules/common/components/ui"
import { Fragment } from "react"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"
import { Locale } from "@lib/data/locales"


const SideMenuItems = {
  Home: "/",
  Store: "/store",
  Account: "/account",
  Cart: "/cart",
}

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
}

const SideMenu = ({ regions, locales, currentLocale }: SideMenuProps) => {
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  aria-label="Open menu"
                  className="relative h-full flex items-center gap-2 transition-all ease-out duration-200 focus:outline-none text-regenx-navy/70 hover:text-regenx-navy"
                >
                  <BarsThree />
                  <span className="hidden small:inline text-xs uppercase tracking-widest font-medium">
                    Menu
                  </span>
                </Popover.Button>
              </div>

              {open && (
                <div
                  className="fixed inset-0 z-[50] bg-regenx-navy/30 pointer-events-auto"
                  onClick={close}
                  data-testid="side-menu-backdrop"
                />
              )}

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0"
                enterTo="opacity-100 backdrop-blur-2xl"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 backdrop-blur-2xl"
                leaveTo="opacity-0"
              >
                <PopoverPanel className="flex flex-col absolute w-full sm:w-[400px] h-[100vh] z-[51] inset-x-0 top-0 text-sm">
                  <div
                    data-testid="nav-menu-popup"
                    className="flex flex-col h-full bg-white border-r border-regenx-navy/10 justify-between p-8"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-12">
                        <span className="font-display text-xl font-semibold text-regenx-navy tracking-[0.05em]">
                          RegenX Labs
                        </span>
                        <button
                          data-testid="close-menu-button"
                          onClick={close}
                          className="text-regenx-navy/60 hover:text-regenx-navy"
                          aria-label="Close menu"
                        >
                          <XMark />
                        </button>
                      </div>
                      <ul className="flex flex-col gap-1 items-start justify-start">
                        {Object.entries(SideMenuItems).map(([name, href]) => {
                          return (
                            <li key={name} className="w-full">
                              <LocalizedClientLink
                                href={href}
                                className="block py-3 text-xl font-display font-medium text-regenx-navy hover:text-regenx-crimson border-b border-regenx-navy/10 transition-colors"
                                onClick={close}
                                data-testid={`${name.toLowerCase()}-link`}
                              >
                                {name}
                              </LocalizedClientLink>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                    <div className="flex flex-col gap-y-5">
                      {!!locales?.length && (
                        <div
                          className="flex justify-between text-regenx-navy/70"
                          onMouseEnter={languageToggleState.open}
                          onMouseLeave={languageToggleState.close}
                        >
                          <LanguageSelect
                            toggleState={languageToggleState}
                            locales={locales}
                            currentLocale={currentLocale}
                          />
                          <ArrowRightMini
                            className={clx(
                              "transition-transform duration-150",
                              languageToggleState.state ? "-rotate-90" : ""
                            )}
                          />
                        </div>
                      )}
                      <div
                        className="flex justify-between text-regenx-navy/70"
                        onMouseEnter={countryToggleState.open}
                        onMouseLeave={countryToggleState.close}
                      >
                        {regions && (
                          <CountrySelect
                            toggleState={countryToggleState}
                            regions={regions}
                          />
                        )}
                        <ArrowRightMini
                          className={clx(
                            "transition-transform duration-150",
                            countryToggleState.state ? "-rotate-90" : ""
                          )}
                        />
                      </div>
                      <Text className="flex justify-between txt-compact-small text-regenx-navy/40">
                        © {new Date().getFullYear()} RegenX Labs. All rights
                        reserved.
                      </Text>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
