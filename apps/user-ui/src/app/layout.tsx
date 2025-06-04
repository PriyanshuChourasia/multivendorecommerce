import Header from '../shared/widgets/header';
import './global.css';
import {Poppins,Roboto} from "next/font/google";
import Providers from './providers';
import StoreProvider from '../redux/redux';

export const metadata = {
  title: 'Ecom',
  description: 'Created by WISH Ecom services',
}

const roboto = Roboto({
  subsets: ['latin'],
  weight: ["100","300","400","500","700","900"],
  variable: "--font-roboto"
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100","200", "300","400","500", "600","700","800", "900"],
  variable: "--font-poppins"
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${poppins.variable}`}>
        <StoreProvider>
          <Providers>
            <Header/>
            {children}
          </Providers>
        </StoreProvider>
      </body>
    </html>
  )
}
