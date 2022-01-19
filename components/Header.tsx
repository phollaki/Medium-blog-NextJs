import Link from 'next/link';

function Header() {
  return (
    <header className='flex justify-between mx-auto max-w-7xl p-5'>
      <div className='flex items-center space-x-5'>
        <Link href='/'>
          <img
            src='https://links.papareact.com/yvf'
            className='w-44 object-contain cursor-pointer'
            alt='Medium blog'
          />
        </Link>
        <div className='hidden sm:inline-flex items-center space-x-5'>
          <h3>About</h3>
          <h3>Contact</h3>
          <h3 className='bg-green-600 text-white cursor-pointer rounded-full px-4 py-1 '>
            Follow
          </h3>
        </div>
      </div>
      <div className='flex items-center space-x-5 pr-5 text-green-600'>
        <h3 className=''>Sign In</h3>
        <h3 className='border border-green-600 rounded-full py-1 px-4 hover:bg-green-600 hover:text-white transition-all duration-500 cursor-pointer'>
          Get Started
        </h3>
      </div>
    </header>
  );
}

export default Header;
