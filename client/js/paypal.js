import { loadScript } from "@paypal/paypal-js";
import { AdRuleExecutionSpec } from "facebook-nodejs-business-sdk";
loadScript({ "client-id": YOUR_CLIENT_ID })
.then((paypal) => {
    const paypalButtonsComponent = paypal.Buttons({
        // optional styling for buttons
        // https://developer.paypal.com/docs/checkout/standard/customize/buttons-style-guide/
        style: {
          color: "gold",
          layout: window.innerWidth<768?"vertical":"horizontal",
          shape:"pill",
         label:"pay",
         tagline :false,
        },
        
        // set up the transaction
        createOrder: async (data, actions) => {
            // pass in any options from the v2 orders create call:
            // https://developer.paypal.com/api/orders/v2/#orders-create-request-body
            await axios.get("/.netlify/functions/payment-card").then((res)=>{
                const createOrderPayload =res.data.createOrderPayload
                return actions.order.create(createOrderPayload);
            })
                
             },
             // finalize the transaction
             onApprove: (data, actions) => {
                 const captureOrderHandler = (details) => {
                     const payerName = details.payer.name.given_name;
                     console.log('Transaction completed');
                              window.location.replace("/thank-you-early-access.html");
                 };
                 return actions.order.capture().then(captureOrderHandler);
             },
             // handle unrecoverable errors
             onError: (err) => {
                 console.error('An error prevented the buyer from checking out with PayPal');
                 var errorElement = document.getElementById('card-errors');
                 errorElement.textContent='An error prevented the buyer from checking out with PayPal'
             }
         });
          paypalButtonsComponent
            .render("#paypal-button-container")
            .catch((err) => {
                console.error('PayPal Buttons failed to render');
                var errorElement = document.getElementById('card-errors');
                errorElement.textContent='PayPal Buttons failed to render'
            });
})
.catch((err) => {
    console.error("failed to load the PayPal JS SDK script", err);
});
