export interface IRegister {
    (server:any, options:any, next:any): void;
    attributes?: any;
}

/**
 * structure of a trip
 */
export interface ITrip {
    _id: string;
    _rev?: string;
    city: string;
    start_date: Date;
    end_date: Date;
    budget: number;
    locations: string[];
    pics: string[];
    type: string;
}

export default
class Trip {
    db:any;
    boom:any;
    joi:any;
    tripSchemaPost:any;
    tripSchemaPUT:any;

    constructor() {
        this.register.attributes = {
            name: 'backend-trip',
            version: '0.1.0'
        };

        this.boom = require('boom');
        this.joi = require('joi');
        this.initSchemas();
    }


    private initSchemas():void {
        var trip = this.joi.object().keys({
            _id: this.joi.string().required(),
            city: this.joi.string().required(),
            start_date: this.joi.date(),
            end_date: this.joi.date(),
            budget: this.joi.number(),
            locations: this.joi.array(),
            pics: this.joi.array(),
            type: this.joi.string().requried().valid('trip')
        });

        var rev = this.joi.object().keys({_rev: this.joi.string().required()});

        this.tripSchemaPost = trip;
        this.tripSchemaPUT = rev.concat(trip);
    }

    register:IRegister = (server, options, next) => {
        server.bind(this);

        server.dependency('backend-database', (server, next) => {
            this.db = server.plugins['backend-database'];
            next();
        });

        this._register(server, options);
        next();
    };

    private _register(server, options) {
        // get all trips
        server.route({
            method: 'GET',
            path: '/trips',
            config: {
                handler: (request, reply) => {
                    this.db.getTrips((err, data) => {
                        if (err) {
                            return reply(this.boom.wrap(err, 400));
                        }
                        reply(data);
                    });
                },
                description: 'Get all trips',
                tags: ['api', 'trip']
            }
        });

        // get a particular trip
        server.route({
            method: 'GET',
            path: '/trips/{tripid}',
            config: {
                handler: (request, reply) => {
                    this.db.getTripById(request.params.tripid, (err, data) => {
                        if (err) {
                            return reply(this.boom.wrap(err, 400));
                        }
                        reply(data);
                    });
                },
                description: 'Get particular trip by id',
                notes: 'sample call: /trips/1222123132',
                tags: ['api', 'trip'],
                validate: {
                    params: {
                        tripid: this.joi.string()
                            .required()
                    }
                }

            }
        });

        // create a new trip
        server.route({
            method: 'POST',
            path: '/trips',
            config: {
                handler: (request, reply) => {
                    this.joi.validate(request.payload, this.tripSchemaPost, (err, trip:ITrip)=> {
                        if (err) {
                            return reply(this.boom.wrap(err, 400, err.details.message));
                        } else {
                            this.db.createUser(trip, (err, data) => {
                                if (err) {
                                    return reply(this.boom.wrap(err, 400, err.details.message));
                                }
                                reply(data);
                            });

                        }
                    });
                },
                description: 'Create new trip',
                tags: ['api', 'trip'],
                validate: {
                    payload: this.tripSchemaPost
                        .required()
                        .description('Trip JSON object')
                }

            }
        });

        // update a particular trip
        server.route({
            method: 'PUT',
            path: '/trips/{tripid}',
            config: {
                handler: (request, reply) => {

                },
                description: 'update a particular trip',
                tags: ['api', 'trip']
            }
        });


        // delete a particular trip
        server.route({
            method: 'DELETE',
            path: '/trips/{tripid}',
            config: {
                handler: (request, reply) => {

                },
                description: 'delete a particular trip',
                tags: ['api', 'trip']
            }
        });


        // Register
        return 'register';
    }

    errorInit(error) {
        if (error) {
            console.log('Error: Failed to load plugin (Trip):', error);
        }
    }

}