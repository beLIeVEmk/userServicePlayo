export const config={
    db:{
        mongo:{
            collections:{
                user:"user",
                group:"group"
            },
            database:{
                playo:"playo",
                connectionString:'mongodb://localhost/playo'
            }
        },
        redis:{
            url:<url>
        }
    },
    jwt:{
        expiryTime:'1d',
        secretKey:'jwtSecret'
    }
}