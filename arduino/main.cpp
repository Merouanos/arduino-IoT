  #include <ArduinoSTL.h>
  #include<vector>
  #include <Arduino.h>
  #include <DHT.h>

  #define DHTPIN 13       
  #define DHTTYPE DHT11   
  
  DHT dht11(DHTPIN, DHTTYPE);



  unsigned long previousTime=0;
  int segPins[] = {2,3,4,5,6,7,8};
  byte digits[10][7] = {
    {1,1,1,0,1,1,1}, // 0 
    {0,0,1,0,0,0,1}, // 1
    {1,1,0,1,0,1,1}, // 2
    {0,1,1,1,0,1,1}, // 3
    {0,0,1,1,1,0,1}, // 4
    {0,1,1,1,1,1,0}, // 5
    {1,1,1,1,1,1,0}, // 6
    {0,0,1,0,0,1,1}, // 7
    {1,1,1,1,1,1,1}, // 8
    {0,1,1,1,1,1,1}  // 9
  };





  enum class State:byte{
    GOOD,
    WARNING,
    CRITICAL
  };

  class Buffer{
    private:
    static constexpr byte BUFFER_SIZE = 5;
    float history[BUFFER_SIZE];
    byte index=0;
    bool initialized = false;


    public:

    float getSmothedValue(float newValue){
    if (!this->initialized) {
      for (byte i = 0; i < this->BUFFER_SIZE; i++) {
        this->history[i] = newValue;
        }
      this->initialized = true;
      }

      this->history[this->index] = newValue;
      this->index = (this->index + 1) % this->BUFFER_SIZE;

    
      float sum = 0;
      for (byte i = 0; i < this->BUFFER_SIZE; i++) sum += this->history[i];
    
      return sum / BUFFER_SIZE;

    }


  };

 

  class Status{

    private:
    State grip;
    short size;
    std::vector<float> checkList;
    std::vector<State> statusList;


    

    public:
    Status(byte size,State grip):checkList(size),statusList(size+1){
      this->size = size; 
      this->grip = grip;
    }

    void setCheckList(float checkList[]){
      for(byte i=0;i<size;i++){
        this->checkList[i]=checkList[i];
      }
    }

      void setStatusList(State statusList[]){
      for(byte i=0;i<=size;i++){
        this->statusList[i]=statusList[i];
      }
    }

    State getGrip(){
      return this->grip;
    }

    State checkValueStatus(float newValue){

      for(byte i=0;i<size;i++){

        if(newValue < checkList[i])return statusList[i];
      }
      return statusList[size];

    }





  };






  class Parameter{
    
    private:
    Buffer& history;
    Status& status;
    unsigned long alertStart = 0;
    bool isAlertActive = false;
    const unsigned long CHECK_TIME=3000;

  

    public:
    Parameter(Buffer& history, Status& st): history(history), status(st){}

    void initialize(float valuesArray[], State  statusArray[]){
      this->status.setCheckList(valuesArray);
      this->status.setStatusList(statusArray);
    }
    Buffer& getBuffer(){
      return this->history;
    }
    Status& getStatus(){
      return this->status;
    }

    State checkPersistent(float newValue){
    State status = this->status.checkValueStatus(newValue);
    if (status == this->status.getGrip()) {
      this->isAlertActive = false;
      return;
    }
    
      if(!this->isAlertActive){
        this->isAlertActive = true;
        this->alertStart=millis();
        return;
      }
      
      if(millis()- this->alertStart > this->CHECK_TIME){

        this->isAlertActive = false;
        return status;

      } 
      
      return ;
    }



  };








  float valueArray[2]={28,30};
  State statusArray[3]={State::GOOD,State::WARNING,State::CRITICAL};
  Buffer tempBuffer;
  Status tempStatus(2,State::GOOD);
  Parameter temperature(tempBuffer,tempStatus);






  float humidArray[2]={20,80};
  State humidSt[3]={State::CRITICAL,State::GOOD,State::CRITICAL};
  Buffer humidBuffer;
  Status humidStatus(2,State::GOOD);
  Parameter humidity(humidBuffer,humidStatus);





  void setup() {

    
    Serial.begin(9600);
    dht11.begin();
    for(byte i=0;i<7;i++){
      pinMode(segPins[i], OUTPUT);

    };

    temperature.initialize(valueArray,statusArray);
    humidity.initialize(humidArray,humidSt);

    Serial.println(F("System started..."));

  
  }

  void show(byte num){
    for(byte i=0;i<7;i++){
      digitalWrite(segPins[i], digits[num][i]);
    }
  }

  int getFreeRam() {
  extern int __heap_start, *__brkval;
  int v;
  return (int) &v - (__brkval == 0 ? (int) &__heap_start : (int) __brkval);
}

  unsigned long lastTime=0;
  void loop() {


    float temp = temperature.getBuffer().getSmothedValue(dht11.readTemperature());
    float humid = humidity.getBuffer().getSmothedValue(dht11.readHumidity());
    
    unsigned long newTime = millis();

    if (isnan(temp) || isnan(humid)) {
      Serial.println(F("Sensor error"));
      return;
    }


    const State statusTemp= temperature.checkPersistent(temp);
    const State statusHumid= humidity.checkPersistent(humid);

    if (newTime - lastTime > 2000) {
    Serial.print(F("{"));
    Serial.print(F("\"t\":")); Serial.print(temp);
    Serial.print(F(",\"h\":")); Serial.print(humid);
    Serial.print(F(",\"r\":")); Serial.print(getFreeRam());

    Serial.print(F(",\"status\":{"));
    Serial.print(F("\"ts\":")); Serial.print((byte)statusTemp); 
    Serial.print(F(",\"hs\":")); Serial.print((byte)statusHumid); 
    Serial.print(F("}"));

    Serial.println(F("}"));
    show(i);
    lastTime = newTime;
    
  }




      

    
    
  
  }