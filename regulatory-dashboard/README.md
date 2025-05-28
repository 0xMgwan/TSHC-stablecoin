# NEDA Pay Regulatory Dashboard

This dashboard provides regulatory oversight for the TSHC stablecoin on the Base network. It is designed for use by central banks, partner banks like ABSA Bank, and financial regulators to monitor the token supply, reserve ratio, and transaction activity.

## Overview

The NEDA Pay Regulatory Dashboard offers comprehensive monitoring tools for regulatory authorities to oversee the TSHC stablecoin ecosystem. It provides real-time data on:

- Token supply and circulation
- Reserve ratio and collateralization
- Transaction monitoring and analysis
- Compliance reporting and documentation

## Features

- **Dashboard**: Overview of key metrics including token supply, reserve ratio, and transaction volume
- **Token Supply Monitoring**: Detailed tracking of token minting and burning operations
- **Reserve Ratio Monitoring**: Real-time monitoring of TSH government bonds, T-bills, and cash equivalents backing TSHC tokens
- **Transaction Monitoring**: Comprehensive transaction tracking and analysis
- **Compliance Reports**: Generation and management of regulatory compliance reports

## Technical Details

The dashboard connects to the TSHC and Reserve smart contracts deployed on the Base network:

- SimpleTSHC: `0x0859D42FD008D617c087DD386667da51570B1aAB`
- SimpleReserve: `0x72Ff093CEA6035fa395c0910B006af2DC4D4E9F5`

## Features

- **Dark/Light Mode**: Toggle between dark and light themes for optimal viewing in any environment
- **TSH Currency Support**: All financial data is displayed in TSH (Tanzanian Shilling) denomination
- **Role-Based Access**: Different views and permissions for central bank, partner banks, and regulators
- **Responsive Design**: Built with Material UI for a seamless experience across all devices

## Setup Instructions

1. Install dependencies:
   ```
   cd regulatory-dashboard
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Build for production:
   ```
   npm run build
   ```

## Test Access

For testing purposes, you can log in with the following credentials:

- **Central Bank**: admin@bot.go.tz / Regulator2025
- **Partner Bank (ABSA)**: compliance@absa.co.tz / Regulator2025
- **Financial Regulator**: inspector@fra.go.tz / Regulator2025

## Deployment

The dashboard can be deployed to any static hosting service such as Netlify, Vercel, or GitHub Pages.

## License

This project is proprietary software owned by NEDA Pay.
