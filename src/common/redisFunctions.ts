import { RedisService } from "@liaoliaots/nestjs-redis";
import { Injectable } from "@nestjs/common";
import Redis from "ioredis";


@Injectable()
export class RedisFunction{
    private readonly client: Redis | null
    constructor(
        private readonly redisService: RedisService
    ){
        this.client = this.redisService.getOrThrow();
    }

    async setRedis(redisKey,redisValue){
        try {
            
            if(typeof redisValue!='string'){
                redisValue=JSON.stringify(redisValue);
            }
            await this.client.set(redisKey,redisValue);
        } catch (error) {
            throw error;
        }     
    }
    async setRedisWithExpiry(redisKey,redisValue,expiry='90d'){
        try {
            
            if(typeof redisValue!='string'){
                redisValue=JSON.stringify(redisValue);
            }
            await this.client.set(redisKey,redisValue,'EX',expiry);
        } catch (error) {
            throw error;
        }     
    }

    async getRedis(redisKey){
        try {
            
            return await this.client.get(redisKey);
        } catch (error) {
            throw error;
        }
    }

    async redisHashSet(redisKey,hkey,hvalue){
        try {
            
            await this.client.hset(redisKey,hkey,hvalue);
        } catch (error) {
           throw error 
        }
    }

    async delRedisHasSet(redisKey,hkey){
        try {
            
            await this.client.hdel(redisKey,hkey)
        } catch (error) {
            throw error;
        }
    }

    async checkPresenceInHset(redisKey,hkey){
        try {
            
            const value=await this.client.hget(redisKey,hkey);
            if(value){
                return true;
            }
            return false
        } catch (error) {
            throw error;
        }
    }

    async deleteRedisKey(redisKey){
        try {
            
            await this.client.del(redisKey);
        } catch (error) {
            throw error;
        }
    }

    async getAllHset(redisKey){
        try {
            return await this.client.hgetall(redisKey);
        } catch (error) {
            throw error;
        }
    }
}