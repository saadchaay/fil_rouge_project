import { Link } from "react-router-dom";
import {
    Timeline,
    PermIdentity,
    Storefront,
    MonetizationOn,
    Home,
    SupervisorAccount,
    Ballot,
    Category,
  } from "@material-ui/icons";

const navigation = [
    { name: 'Home', to: '/dashboard', icon: Home, current: true },
    { name: 'Analytics', to: '/analytics', icon: Timeline, current: false },
    { name: 'Sales', to: '/sales', icon: MonetizationOn, current: false },
  ]
  
  const secondaryNavigation = [
    { name: 'Users', to: '/users', icon: SupervisorAccount },
    { name: 'Customers', to: '/customers', icon: PermIdentity },
    { name: 'Orders', to: '/orders', icon: Ballot },
    { name: 'Products', to: '/products', icon: Storefront },
    { name: 'Categories', to: '/categories', icon: Category },
  ]

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }
export default function Sidebar() {
  
    return (
        <>
        {/* Sidebar component, swap this element with another sidebar if you like */}
            <div className="flex flex-col flex-grow bg-cyan-700 pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-4">
                <img
                    className="h-8 w-auto"
                    src="https://tailwindui.com/img/logos/easywire-logo-cyan-300-mark-white-text.svg"
                    alt="Easywire logo"
                />
                </div>
                <nav
                className="mt-5 flex-1 flex flex-col divide-y divide-cyan-800 overflow-y-auto"
                aria-label="Sidebar"
                >
                <div className="px-2 space-y-1">
                    {navigation.map((item) => (
                    <span
                        key={item.name}
                        className={classNames(
                        item.current
                            ? "bg-cyan-800 text-white"
                            : "text-cyan-100 hover:text-white hover:bg-cyan-600",
                        "group flex items-center px-2 py-2 text-sm leading-6 font-medium rounded-md"
                        )}
                        aria-current={item.current ? "page" : undefined}
                    >
                        <item.icon
                        className="mr-4 flex-shrink-0 h-6 w-6 text-cyan-200"
                        aria-hidden="true"
                        />
                        <Link to={item.to}>{item.name}</Link>
                    </span>
                    ))}
                </div>
                <div className="mt-6 pt-6">
                    <div className="px-2 space-y-1">
                    {secondaryNavigation.map((item) => (
                        <span
                        key={item.name}
                        className="group flex items-center px-2 py-2 text-sm leading-6 font-medium rounded-md text-cyan-100 hover:text-white hover:bg-cyan-600"
                        >
                        <item.icon
                            className="mr-4 h-6 w-6 text-cyan-200"
                            aria-hidden="true"
                        />
                        <Link to={item.to}>
                            {item.name}
                        </Link>
                        
                        </span>
                    ))}
                    </div>
                </div>
                </nav>
            </div>
        </>
    );
}
