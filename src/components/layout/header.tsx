import Link from 'next/link'
import {Video} from 'lucide-react'

const Header = () =>{
    return(
        <header className='py-4 px-6 border-b'>
            <div className = 'container mx-auto flex justify-between items-center'>
                <Link href="/" className='flex items-center gap-4'>
                {/* icon here */}
                <span >AEOS Stream</span>
                </Link>

                <div>
                    <div>
                        **Actions**
                    </div>
                </div>


            </div>
        </header>
    )
}

export default Header

// This is a basic header to be improved later