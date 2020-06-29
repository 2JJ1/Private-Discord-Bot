var throttles = {}

/**
 * Memory based throttler via rate-limiting. Overflowed rate-limited calls will be queued.
 * @param id A new time cache is created for each throttle id
 * @param options These must be the same for each throttle id
 * @param options.maxCalls How many calls can be made within the the time frame(Default 25)
 * @param options.timeFrame Up to how long in seconds records should be checked(Default 60)
 */
module.exports = function(id, options){
    // Rate limit
    //timeFrame in seconds
    var timeFrame = options.timeFrame || 60
    //Max Calls
    var maxCalls = options.maxCalls || 25

    return new Promise((resolve, reject) => {
        if(!throttles[id]) throttles[id] = []
        //Get the list of cached records for this id
        var throttledCalls = throttles[id]

        //Deletes old records (Only records made within the timeFrame remain)
        if(throttledCalls.length > 0){
            for(var i=throttledCalls.length-1; i>=0; i--){
                if((new Date().getTime() - throttledCalls[i])/1000 > timeFrame) throttledCalls.splice(i, 1)
            }
        }

        //Records this call
        throttledCalls.push(new Date().getTime())

        //Check if the rate limit is exceeded
        if(throttledCalls.length > maxCalls) {
            //Reject the call if queues are disallowed
            if(options.burst === false) reject()
            //Queue exceeded calls
            else {
                //Each overflowed call will wait this amount of time
                const exceedCount = throttledCalls.length - maxCalls
                const secondsToDelay = (timeFrame/maxCalls) * exceedCount
                setTimeout(()=>resolve({exceedCount}), secondsToDelay * 1000)
            }
        }
        //The rate limit was not exceeded
        else resolve({})
    })
}