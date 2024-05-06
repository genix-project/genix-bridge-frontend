THIS IS FOR FRONTEND ONLY and does nothing to backend functioning or logic

## Step 1
********* I CAN NOT STRESS ENOUGH VERIFY everything is there from current production builds *************

## Step 2
Run `yarn install` to install dependencies.

## Step 3
***** Compare to your existing project  Make sure everything is there *****

## Step 4
Merge this project with your existing genix project 

Run `yarn start`

## Step 5
Toggling Maint Mode On/Off
In src/App.jsx

Toggling Mode 

{/*Toggle Maint Mode  const maintenance=   | true = Maint Mode on  |  false = Maint Mode Off*/}
  const maintenance = false; <--------- Toggle true/false
  return (
    <>
      {maintenance ? (
        <Maintenance />
      ) : (
thats it ! Maint Mode package added

## Step 6 
Run `yarn start`

Confirm Changes Are Working  Correctly with toggle

## Step 7
Run `yarn build`

## Step 8
Then serve in your normal method "(Node & Express) or Apache HTTP

See https://create-react-app.dev/docs/deployment

You will need to redeploy after toggling off/on 

Notes: 
File Changes
/src/App.jsx

Files Added 
/assets/Comp-1_1.gif
