import json
import os

# The MOT manual data from the paste.txt file

mot_manual_data ={
    
    "title": "MOT Inspection Manual: Cars and Passenger Vehicles",
    "sections": [
      {
        "id": "1",
        "title": "Brakes",
        "description": "Brake condition and operation, service brakes, secondary brakes, parking brakes, anti-lock braking system (ABS), electronic braking system (EBS) and brake fluid rules and inspection for car and passenger vehicle MOT tests.",
        "subsections": [
          {
            "id": "1.1",
            "title": "Condition and operation",
            "items": [
              {
                "id": "1.1.1",
                "title": "Service brake pedal or hand lever pivot",
                "defects": [
                  {
                    "description": "Pivot too tight",
                    "category": "Major"
                  },
                  {
                    "description": "Excessive wear or free play",
                    "category": "Major"
                  }
                ]
              }
            ]
          },
          {
            "id": "1.3",
            "title": "Secondary brake performance and efficiency",
            "items": [
              {
                "id": "1.3.1",
                "title": "Performance",
                "description": "This inspection is only for vehicles with a single line braking system. If the secondary brake is also the park brake then there is no need to carry out a separate park brake test.\n\nThe secondary brake control may be the parking brake lever, or a separate brake control.\n\nWhen testing transmission parking brakes, the minimum secondary brake efficiency requirement must be calculated before the brake is tested. As soon as the minimum efficiency requirement is reached the brake testing must cease to avoid any possible damage.",
                "subItems": [
                  {
                    "title": "Using a roller brake tester",
                    "description": "1. On each axle which has a secondary brake fitted, run the rollers and gradually apply the secondary brake keeping any \"hold-on\" button or trigger disengaged the whole time, watching how the braking effort for each wheel increases.\n\n2. Continue to apply the parking brake until maximum effort is achieved, or until the wheels lock and slip on the rollers. If the vehicle is ejected from the brake rollers, the required brake efforts may not be achieved, it will be necessary to repeat the test and chock the wheels which are not being tested.\n\n3. Record the reading at which the maximum braking effort is achieved and whether the wheels locked. Stop the rollers if they have not stopped automatically."
                  },
                  {
                    "title": "Using a plate brake tester",
                    "description": "1. Drive the vehicle forwards at a steady speed of about 4mph up to the plate tester.\n\n2. As soon as the wheels are on the plate high friction braking surfaces, gradually apply the secondary brake, keeping any 'hold-on' button or trigger disengaged the whole time, until maximum effort is achieved.\n\n3. Note the way in which the brake efforts increase and the maximum values achieved.\n\nIf a vehicle fails any aspect of the plate brake test, the check should be repeated to confirm the result."
                  },
                  {
                    "title": "Using a decelerometer",
                    "description": "If the vehicle or system is of a type which cannot be tested on a roller brake tester, set up the decelerometer in the vehicle in accordance with the equipment manufacturer's instructions.\n\n1. Drive the vehicle on a level road at a steady speed of approximately 20mph (32kph) and progressively apply the secondary brake to maximum.\n\n2. Note the recorded brake efficiency."
                  },
                  {
                    "title": "Brake test results",
                    "description": "For details of entering brake test results, see Section 1.2.2."
                  }
                ],
                "defects": [
                  {
                    "description": "Braking effort: inadequate at any wheel",
                    "category": "Major"
                  },
                  {
                    "description": "Braking effort: not recording at any wheel",
                    "category": "Dangerous"
                  },
                  {
                    "description": "Brakes imbalance across an axle such that: the braking effort from any wheel is less than 70% of the maximum effort recorded from the other wheel on the same axle. Or in the case of testing on the road, the vehicle deviates excessively from a straight line.",
                    "category": "Major"
                  },
                  {
                    "description": "Brakes imbalance across an axle such that: the braking effort from any wheel is less than 50% of the maximum effort recorded from the other wheel on a steered axle",
                    "category": "Dangerous"
                  },
                  {
                    "description": "A brake on any wheel grabbing severely",
                    "category": "Major"
                  }
                ]
              },
              {
                "id": "1.3.2",
                "title": "Efficiency",
                "description": "When conducting a test on a roller brake tester (RBT) where more than half of the wheels of a brake system lock the efficiency requirements for that system are considered to be met.\n\nVehicles with a single line braking system must meet the following minimum secondary brake efficiency requirements:",
                "table": [
                  {
                    "Vehicle type": "M2 and M3 vehicles having a service brake operating on at least 4 wheels which were first used before 1 January 1968",
                    "Efficiency requirement": "20%"
                  },
                  {
                    "Vehicle type": "Vehicles first used before 1 January 1968 which do NOT have one means of control operating on at least 4 wheels and which have one brake system with two means of control or two brake systems with separate means of control",
                    "Efficiency requirement": "25% from 2nd means of control"
                  },
                  {
                    "Vehicle type": "All other vehicles",
                    "Efficiency requirement": "25%"
                  }
                ],
                "additionalInfo": "Vehicles first used before 1 January 1915 must only have one efficient braking system.",
                "defects": [
                  {
                    "description": "Parking brake efficiency: below minimum requirement",
                    "category": "Major"
                  },
                  {
                    "description": "Parking brake efficiency: less than 50% of the required value",
                    "category": "Dangerous"
                  }
                ]
              }
            ]
          },
          {
            "id": "1.4",
            "title": "Parking brake performance and efficiency",
            "items": [
              {
                "id": "1.4.1",
                "title": "Performance",
                "description": "You only need to inspect vehicles that have not already had the parking brake system tested as the secondary brake.\n\nThese vehicles must instead meet the secondary brake test requirements. For details see Section 1.3.1 and 1.3.2.\n\nThe primary brake tester must be used unless the vehicle is unsuitable due to its drive configuration, transmission type or braking system. If this is the case, a decelerometer or gradient test may be appropriate. A gradient test must only be carried out if the parking brake cannot be tested using the primary brake tester or decelerometer. This will usually only be necessary on certain all-wheel drive vehicles with electronic parking brakes where no vehicle technical information is available.\n\nWhen testing transmission parking brakes, the minimum parking brake efficiency requirement must be calculated before the brake is tested. As soon as the minimum efficiency requirement is reached the brake testing must cease to avoid any possible damage.\n\nA small number of large vehicles, such as some American motor caravans, have a parking brake which is not suitable for a dynamic brake test. In such cases a gradient test must be carried out.\n\nThree-wheeled vehicles only require a parking brake on one wheel.",
                "subItems": [
                  {
                    "title": "Using a roller brake tester",
                    "description": "1. Run the rollers on each axle that has the parking brake fitted and gradually apply the parking brake, keeping any 'hold-on' button or trigger disengaged the whole time.\n\n2. Continue to apply the brake until maximum effort is achieved, or until the wheels lock and slip on the rollers. If the vehicle is ejected from the brake rollers, the required brake efforts may not be achieved, it will be necessary to repeat the test and chock the wheels which are not being tested.\n\n3. Record the reading at which the maximum braking effort is achieved and whether the wheels locked. Stop the rollers if they have not stopped automatically.\n\nLarge vehicles fitted with spring brakes, lock actuators or air assisted parking brakes may require an applied brake test for assessing parking brake efficiency. This test must only be conducted on an approved Class 5 roller brake tester with the appropriate 'Applied Brake Test' programme.\n\n1. Apply the parking brake fully and then release any power assistance. The service brake may be used to assist in setting the parking brake.\n\n2. Start each brake roller in turn and note the recorded maximum effort."
                  },
                  {
                    "title": "Using a plate brake tester",
                    "description": "1. Drive the vehicle forwards at a steady speed of about 4mph up to the plate tester.\n\n2. As soon as the wheels are on the plate's high friction braking surfaces, gradually apply the parking brake, keeping any \"hold-on\" button or trigger disengaged the whole time, until maximum effort is achieved.\n\n3. Note the maximum values achieved.\n\nIf a vehicle fails any aspect of the plate brake test, the check should be repeated to confirm the result."
                  },
                  {
                    "title": "Using a decelerometer",
                    "description": "If the vehicle or system cannot be tested on a roller brake tester, set up the decelerometer in the vehicle as instructed by the equipment manufacturer.\n\n1. Drive the vehicle on a level road at a steady speed of approximately 20mph (32kph) and progressively apply the parking brake to maximum.\n\n2. Note the recorded brake efficiency.\n\nDecelerometer brake testing must always be carried out on suitable roads with as little traffic as possible. A particular public road should not be used for tests so frequently that it could cause complaints from residents."
                  },
                  {
                    "title": "Using a gradient tester",
                    "description": "A gradient test must only be carried out on vehicles that are not suitable for a parking brake test with the primary brake tester or decelerometer. This will usually only be necessary on certain all-wheel drive vehicles with electronic parking brakes where no vehicle technical information is available.\n\nA suitable gradient is considered to be one which:\n- is longer than the wheelbase of the vehicle\n- is not more than 16%\n- is as close to 16% as possible within a 3 mile radius of the testing station\n- if on a public road is in a safe place to conduct the test\n\n1. Reverse the vehicle onto the gradient.\n\n2. Hold the vehicle on the service brake whilst setting the parking brake.\n\n3. Release the service brake and note if the vehicle is held on the gradient."
                  },
                  {
                    "title": "Brake test results",
                    "description": "For details of entering brake test results see Section 1.2.2."
                  }
                ],
                "defects": [
                  {
                    "description": "Parking brake inoperative on one side, or in the case of testing on the road, the vehicle deviates excessively from a straight line",
                    "category": "Major"
                  }
                ]
              },
              {
                "id": "1.4.2",
                "title": "Efficiency",
                "description": "You only need to inspect vehicles that have not already had the parking brake system tested as the secondary brake.\n\nThese vehicles must instead meet the secondary brake test requirements. For details see Section 1.3.1 and 1.3.2.\n\nFor details of conducting the test see Section 1.4.1.\n\nM2 and M3 vehicles that were first used before 1 January 1968 and that have a service brake operating on at least 4 wheels, have no specified parking brake efficiency requirement. However, they must have a parking brake that can prevent at least two wheels from turning. For vehicle category definitions see 'Abbreviations and definitions' in the 'Introduction'.\n\nVehicles first used before 1 January 1915 only need one efficient braking system. They do not need to meet a specified efficiency requirement.\n\nAll other vehicles must achieve a minimum parking brake efficiency of 16%.\n\nWhen conducting a test on a roller brake tester (RBT) where more than half of the wheels of a brake system lock the efficiency requirements for that system are considered to be met.",
                "defects": [
                  {
                    "description": "Parking brake efficiency: below minimum requirement",
                    "category": "Major"
                  },
                  {
                    "description": "Parking brake efficiency: less than 50% of the required value",
                    "category": "Dangerous"
                  }
                ]
              }
            ]
          },
          {
            "id": "1.5",
            "title": "Additional braking device (retarder) performance",
            "description": "You must inspect any additional braking device fitted, such as an electric or fluid retarder or an exhaust brake.\nIt is not necessary to drive the vehicle to carry out this inspection.",
            "defects": [
              {
                "description": "Control for electronic retarder does not allow gradual variation in effort",
                "category": "Major"
              },
              {
                "description": "System obviously inoperative",
                "category": "Major"
              }
            ]
          },
          {
            "id": "1.6",
            "title": "Anti-lock braking system (ABS)",
            "description": "You must inspect any ABS systems fitted.\n\nWhen testing ABS equipped vehicles, the road wheels that are lifted off the ground should not be allowed to rotate when the ignition is on. This can cause the ABS system to indicate a fault which may require specialist equipment to rectify.\n\nIf the ABS has been intentionally rendered inoperative, the whole system must be removed. This does not apply to sensor rings or other ABS components which are an integral part of another component, such as a brake disc or drive shaft.\n\nIt's not permissible to remove or disable the ABS from a vehicle first used on or after 1 January 2010. Not all vehicles first used on or after 1 January 2010 will have ABS, so the failure only applies where the system has obviously been removed.",
            "defects": [
              {
                "description": "Warning device not working",
                "category": "Major"
              },
              {
                "description": "Warning device shows system malfunction",
                "category": "Major"
              },
              {
                "description": "Wheel speed sensors missing or damaged",
                "category": "Major"
              },
              {
                "description": "Wiring damaged",
                "category": "Major"
              },
              {
                "description": "Other components missing or damaged",
                "category": "Major"
              },
              {
                "description": "ABS system obviously removed",
                "category": "Major"
              }
            ]
          },
          {
            "id": "1.7",
            "title": "Electronic braking system (EBS)",
            "description": "You must inspect the warning lamp operation on vehicles with an electronically controlled braking system.",
            "defects": [
              {
                "description": "Warning device not working",
                "category": "Major"
              },
              {
                "description": "Warning device shows system malfunction",
                "category": "Major"
              }
            ]
          },
          {
            "id": "1.8",
            "title": "Brake fluid",
            "description": "Hydraulic brake fluid level checks are confined to transparent reservoirs, reservoir caps should not be removed.\nOn many vehicles, you will not be able to see if the brake fluid is contaminated. You should only fail a vehicle if you can clearly see that the fluid is contaminated.",
            "defects": [
              {
                "description": "Brake fluid contaminated",
                "category": "Major"
              }
            ]
          },
          {
            "id": "1.2.2",
            "title": "Efficiency",
            "description": "Manufacturer's plates\n\nVehicles first used before 1 August 1980 may not have a manufacturer's plate.\n\nMost manufacturer's plates will usually show four weights:\n- Design Gross Weight - The maximum weight of the vehicle and any load carried\n- Design Train Weight – The maximum combined weight of the vehicle and any trailer towed\n- Maximum front axle weight\n- Maximum rear axle weight\n\nThree-axle vehicles will show an additional maximum axle weight.\n\nSome vehicles will not show a train weight because they have not been designed to tow a trailer.\n\nGoods vehicles may show two columns of weights.\n\nIn these cases, one column will be the maximum design weights and the other column will be the maximum permissible weights in Great Britain, otherwise known as Maximum Authorised Mass (MAM).\n\nWhere a Design Gross Weight is not shown, then the Gross GB Weight or MAM is used for brake percentage efficiency calculations on vehicles in Class 7.\n\nNote: On goods vehicles presented with a 'Ministry' plate (VTG6 or VTG6T) then the information displayed on that plate will always override the information displayed on the Manufacturer's plate.\n\nThe registration number and chassis number on the 'Ministry' plate must always be cross checked to ensure the plate relates to that vehicle.",
            "subItems": [
              {
                "title": "Calculating brake efficiency",
                "description": "For most vehicles the MOT testing service will calculate brake efficiencies automatically.\n\nIf MTS is not working, add the brake efforts from each wheel for the system that is being tested and carry out the following calculation:\n\n% efficiency = (total brake effort / vehicle test weight) x 100\n\nThe vehicle test weight will depend on the vehicle test class.\n\nFor Classes 3 and 4 use the weight shown by the brake test equipment. Otherwise, take the weight from a weight data chart or some other reliable source.\n\nFor quadricycles and three-wheeled vehicles in Class 4 with two brake controls, one control must achieve an efficiency of at least 30% and the other control 25%.\n\nThe efficiency calculation for each control is the total from the wheel(s) when operated by that control only.\n\nIf the vehicle can be tested using the RBT, test the brakes in the normal way and note the readings.\n\nManually calculate the service brake test results. Note: the percentage efficiency for each control still has to be met.\n\nEfficiency % = (Total brake effort from control 1)/(Vehicle test weight) x 100\nEfficiency % = (Total brake effort from control 2)/(Vehicle test weight) x 100\n\nFor Class 7 use the DGW from the manufacture's plate or, the nominal DGW of 2,600kg if using a plate brake tester and the presented weight is less than 2,000kg.\n\nFor Class 5 use the lesser of the DGW or maximum authorised mass (MAM) from the manufacturer's plate. On vehicles where only the ULW is displayed, you must calculate the DGW by multiplying the number of passenger seats by 63.5kg (or 140lbs) and adding the ULW, for example: \n52 seats × 63.5kg = 3302kg + 5,250kg ULW = 8552kg\n\nWhen conducting a test on a roller brake tester (RBT) where more than half of the wheels of a brake system lock the efficiency requirements for that system are considered to be met."
              },
              {
                "title": "Efficiency requirements",
                "description": "For vehicle category definitions see the 'Abbreviations and definitions' in the 'Introduction'.",
                "table": [
                  {
                    "Vehicle type": "M1 vehicles having a service brake operating on at least 4 wheels and which were first used: on or after 1 September 2010",
                    "Efficiency requirement": "58%"
                  },
                  {
                    "Vehicle type": "M1 vehicles having a service brake operating on at least 4 wheels and which were first used: before 1 September 2010",
                    "Efficiency requirement": "50%"
                  },
                  {
                    "Vehicle type": "N1 vehicles",
                    "Efficiency requirement": "50%"
                  },
                  {
                    "Vehicle type": "M2 and M3 vehicles having a service brake operating on at least 4 wheels which were first used: on or after 1 January 1968",
                    "Efficiency requirement": "50%"
                  },
                  {
                    "Vehicle type": "M2 and M3 vehicles having a service brake operating on at least 4 wheels which were first used: before 1 January 1968",
                    "Efficiency requirement": "45%"
                  },
                  {
                    "Vehicle type": "L2 and L6 vehicles with a single service brake control that operates the brakes on all wheels",
                    "Efficiency requirement": "40%"
                  },
                  {
                    "Vehicle type": "L5 vehicles with a single service brake control that operates the brakes on all wheels which were first used: on or after 1 January 1968",
                    "Efficiency requirement": "50%"
                  },
                  {
                    "Vehicle type": "L5 vehicles with a single service brake control that operates the brakes on all wheels which were first used: before 1 January 1968",
                    "Efficiency requirement": "40%"
                  },
                  {
                    "Vehicle type": "L7 vehicles with a single service brake control that operates the brakes on all wheels",
                    "Efficiency requirement": "50%"
                  },
                  {
                    "Vehicle type": "Vehicles first used before 1 January 1968 which do NOT have one means of control operating on at least 4 wheels and which have one brake system with two means of control or two brake systems with separate means of control",
                    "Efficiency requirement": "30% from 1st means of control, 25% from 2nd means of control"
                  },
                  {
                    "Vehicle type": "Any L category vehicle with two service brake systems each having a separate means of operation",
                    "Efficiency requirement": "30% from 1st means of control, 25% from 2nd means of control"
                  },
                  {
                    "Vehicle type": "Vehicles first used before 1 January 1915 only require one efficient braking system",
                    "Efficiency requirement": "No specific requirement"
                  }
                ]
              },
              {
                "title": "Brake test results",
                "description": "Brake efforts achieved during a test should be entered on the MOT testing service as follows:\n\nRoller and plate brake tests:\n\n1. Enter the brake effort from each wheel and whether they 'lock-up'. The MOT testing service will automatically calculate the brake efficiency and out of balance results\n\n2. Enter other defects manually.\n\nThere is no provision in MTS to calculate the service brake test results for quadricycles or three-wheeled vehicles in Class 4 with two brake controls.\n\nBrake test results for Quadricycles:\n\nOn the 'Brake test configuration' screen, select dual braking system.\n\nOn the 'Add brake test results' screen, for quadricycles enter the actual brake readings for both axles and manually calculate the efficiency for each control.\n\nRecord the service brake readings indicating that all wheels have locked, regardless of whether wheels have actually locked.\n\nBrake test results for Class 4 Three-wheeled vehicles:\n\nThe recording of these vehicles is the same as for quadricycles.\n\nOn the 'Add brake test results' screen divide the reading for the single wheel by 2 and enter this figure in both boxes for the axle with the single wheel.\n\nIf the 30% or the 25% requirements have not been met, the service brake result is a fail, enter a manual failure for brake efficiency as follows:\n\nAdd a defect:\n\n1. Select 'Brakes - Brake performance – Service brake performance – RBT'\n\n2. Select 'Service brake efficiency (trikes, quads and pre-68 vehicles)'\n\n3. Select 'Service brake efficiency below requirements'\n\nIn the comments box state which control has failed acting on which axle.\n\nPlate brake tests:\n\n1. Enter the brake effort from each wheel. The MOT testing service will automatically calculate brake efficiency and out of balance results.\n\n2. Enter other defects manually.\n\nDecelerometer tests:\n\n1. Enter the efficiencies recorded by the meter. The MOT testing service will automatically pass or fail the vehicle on brake efficiency.\n\n2. Enter other defects manually.\n\nIf the MOT testing service is unavailable, refer to the latest edition of the MOT Testing Guide.\n\nIn cases where the required brake efficiency is only just met, but the tester knows that a higher performance figure is normally obtained for the vehicle type, the vehicle presenter should be informed."
              }
            ],
            "defects": [
              {
                "description": "Service brake efficiency: below minimum requirement",
                "category": "Major"
              },
              {
                "description": "Service brake efficiency: less than 50% of the required value",
                "category": "Dangerous"
              }
            ]
          },
          {
            "id": "1.1.2",
            "title": "Service brake pedal or hand lever condition and travel",
            "description": "A brake pedal rubber is an anti-slip material and is therefore not regarded as a defect if it's worn smooth.\n\nA brake pedal without a rubber usually has grooves or raised sections to provide grip in wet conditions and should be rejected if it's worn smooth. However, some vehicles may have been manufactured with a brake pedal which did not incorporate grooves or the fitting of an anti-slip material and these should not be rejected.\n\nYou should reject a brake pedal if its grooves or raised grip sections are worn smooth. However, you should not reject a brake pedal if the vehicle has been manufactured with one that does not have grooves or anti-slip material.\n\nOften a vehicle is fitted with an aftermarket brake pedal rubber. It is not a defect if the design pattern of the brake pedal rubber is worn smooth.\n\nA vehicle should only be failed for insufficient reserve if the pedal or lever is touching the floor/handlebar. Checks on vehicles with power-assisted braking systems should be carried out with the engine off.\n\nIt may be possible on motorcycle derived systems for the brake lever to touch the handlebar. In such cases the extent of reserve travel should be assessed during the brake test.",
            "defects": [
              {
                "description": "Insufficient reserve travel",
                "category": "Major"
              },
              {
                "description": "Service brake control: not releasing correctly",
                "category": "Minor"
              },
              {
                "description": "Service brake control: functionality of brakes affected",
                "category": "Major"
              },
              {
                "description": "Anti-slip provision missing, loose or worn smooth",
                "category": "Major"
              }
            ]
          },
          {
            "id": "1.1.3",
            "title": "Air and vacuum systems",
            "description": "Vehicles first used before 1 October 1937 do not need to be tested for air and vacuum systems.\n\nA vehicle with an ULW up to and including 3,050kg, with a reservoir coupled direct to the induction manifold or a reservoir integral in a servo unit, does not need to be fitted with a warning device.\n\nTo check the build-up of air or vacuum:\n\n1. Completely empty the reservoir by repeatedly pressing the service brake pedal.\n2. Start the engine and run it at just below the governed speed if diesel, or at 2,000rpm if petrol.\n3. Check the time it takes for the warning device to stop operating. Pressure build-up is considered satisfactory if the warning device stops operating within:\n   - 3 minutes for pressure systems\n   - 1 minute for vacuum systems\n\nFor checks that require reference to a pressure or vacuum gauge warning mark, but no warning mark is present, the following reference values should be used:\n- 45psi (3.1kg/cm² or 3 bar) for a pressure gauge\n- 10\" to 12\" (25 to 30cm) for a vacuum gauge",
            "defects": [
              {
                "description": "Insufficient pressure/vacuum assistance for less than: four brake applications after the warning device has operated (or gauge shows an unsafe reading)",
                "category": "Major"
              },
              {
                "description": "Insufficient pressure/vacuum assistance for less than: two brake applications after warning device has operated (or gauge shows an unsafe reading)",
                "category": "Dangerous"
              },
              {
                "description": "Time taken to build up air pressure/vacuum to safe working value not in accordance with the requirements",
                "category": "Major"
              },
              {
                "description": "Repeated operation of any ancillary air or vacuum system completely depletes the stored air or vacuum for the braking system",
                "category": "Major"
              },
              {
                "description": "Air leak causing a noticeable drop in pressure or audible air leak",
                "category": "Major"
              },
              {
                "description": "External damage likely to affect the function of the braking system",
                "category": "Major"
              }
            ]
          },
          {
            "id": "1.1.4",
            "title": "Low-pressure warning",
            "description": "Vehicles first used before 1 October 1937 do not need to be tested for low-pressure warning.\n\nA vehicle with an ULW up to and including 3,050kg with a reservoir coupled direct to the induction manifold or a reservoir integral in a servo unit, is not necessarily required to be fitted with a warning device.\n\nWarning devices may be visual or audible but only one needs to work if both are fitted.\n\nSome vehicles with full power hydraulic braking systems will illuminate the low-pressure warning light as soon as the ignition is switched on. It is not a defect unless the warning light stays on after the engine has been started.",
            "defects": [
              {
                "description": "Low-pressure warning gauge or indicator: malfunctioning or defective",
                "category": "Minor"
              },
              {
                "description": "Low-pressure warning gauge or indicator: not identifying low-pressure",
                "category": "Major"
              }
            ]
          },
          {
            "id": "1.1.5",
            "title": "Hand operated brake control valve",
            "description": "All vehicles with a secondary brake control - in addition to or in place of the normal parking brake lever - must be inspected.",
            "defects": [
              {
                "description": "Control cracked, damaged or excessively worn",
                "category": "Major"
              },
              {
                "description": "Control insecure on valve or valve insecure",
                "category": "Major"
              },
              {
                "description": "Loose connections or leaks in the system",
                "category": "Major"
              },
              {
                "description": "Malfunctioning",
                "category": "Major"
              }
            ]
          },
          {
            "id": "1.1.6",
            "title": "Parking brake lever or control",
            "description": "Vehicles first used before 1906 do not need to have a parking brake.\n\nSome defects in this sub-section may not apply to the type of parking brake fitted.\n\nA parking brake lever must have obvious excessive travel before being rejected.\n\nAn electronic parking brake (EPB) may apply automatically in certain conditions, such as when the ignition is switched off or when the driver's door is opened. Testers should be aware of this throughout the test.\n\nElectronic parking brakes must be maintained in operation by direct mechanical means, even though they are applied electronically. However, the mechanism for keeping the brakes applied is usually within brake calliper or motor gear assembly and therefore not easy to see.\n\nHydraulic parking brakes as an only means of operation are not acceptable on vehicles first used on or after 1 January 1968. However, they may be used to assist the application or release of a mechanical brake.\n\nQuadricycles may be fitted with one of the following types of parking brake:\n- an over-centre lever that is mounted on handlebars\n- a gear lever that operates a cable when it's moved into the park position\n- a transmission lock, which is the 'P' position on machines with continuously variable transmission (CVT)\n\nThese machines are type approved and should not be rejected for design features that prevent them from meeting the stated requirements.\n\nIf the parking brake is the 'P' position on the gearbox, the efficiency of the brake cannot be tested. The tester must therefore assess the brake by using a gradient (ideally 16%), or by attempting to push the machine when 'P' is selected.\n\nThe over-centre lever type can be brake tested as normal using one of the approved test methods.",
            "defects": [
              {
                "description": "Ratchet not holding correctly",
                "category": "Major"
              },
              {
                "description": "Parking brake lever pivot or ratchet mechanism: obviously worn",
                "category": "Minor"
              },
              {
                "description": "Parking brake lever pivot or ratchet mechanism: worn to the extent that the brake may inadvertently release",
                "category": "Major"
              },
              {
                "description": "Parking brake lever has excessive movement indicating incorrect adjustment",
                "category": "Major"
              },
              {
                "description": "Parking brake control missing, defective or inoperative",
                "category": "Major"
              },
              {
                "description": "Electronic parking brake MIL indicates a malfunction",
                "category": "Major"
              },
              {
                "description": "Parking brake is not capable of being maintained in operation by direct mechanical action only (vehicle first used on or after 1 January 1968)",
                "category": "Major"
              }
            ]
          },
          {
            "id": "1.1.7",
            "title": "Brake valves",
            "defects": [
              {
                "description": "Valve: damaged or excessive air leak",
                "category": "Major"
              },
              {
                "description": "Valve: leaking such that brake functionality is affected",
                "category": "Dangerous"
              },
              {
                "description": "Excessive oil discharge from a compressor or brake valve",
                "category": "Minor"
              },
              {
                "description": "Valve insecure or inadequately mounted",
                "category": "Major"
              },
              {
                "description": "Hydraulic fluid: leak from a brake valve",
                "category": "Major"
              },
              {
                "description": "Hydraulic fluid: leak from a brake valve such that brake functionality is affected",
                "category": "Dangerous"
              }
            ]
          },
          {
            "id": "1.1.8",
            "title": "Not in use"
          },
          {
            "id": "1.1.9",
            "title": "Pressure storage reservoirs",
            "description": "Vehicles first used on 1 October 1937 or later must have their air and air/hydraulic braking systems inspected.",
            "defects": [
              {
                "description": "Reservoir: has minor damage or corrosion",
                "category": "Minor"
              },
              {
                "description": "Reservoir: heavily damaged, heavily corroded or leaking",
                "category": "Major"
              },
              {
                "description": "Drain device on an air brake system: operation affected",
                "category": "Minor"
              },
              {
                "description": "Drain device on an air brake system: inoperative",
                "category": "Major"
              },
              {
                "description": "Reservoir insecure or inadequately mounted",
                "category": "Major"
              }
            ]
          },
          {
            "id": "1.1.10",
            "title": "Brake servo units and master cylinder (hydraulic systems)",
            "description": "Hydraulic brake fluid level checks are confined to transparent reservoirs or where an indicator is fitted. Reservoir caps should not be removed.\n\nA brake fluid warning lamp may be shared with other components, for example to indicate that brake pads are worn or the parking brake is applied. Class 3 vehicles are not inspected for brake fluid warning lamp.\n\nTo check the brake vacuum servo:\n\n1. Make sure the engine is switched off.\n2. Deplete the stored vacuum by repeatedly applying the service brake.\n3. Fully apply the brake and hold at a constant pressure.\n4. Start the engine.\n5. Note if the pedal can be felt to travel further.",
            "defects": [
              {
                "description": "Brake servo: defective or ineffective",
                "category": "Major"
              },
              {
                "description": "Brake servo: inoperative",
                "category": "Dangerous"
              },
              {
                "description": "Master cylinder: defective but brake still operating",
                "category": "Major"
              },
              {
                "description": "Master cylinder: leaking",
                "category": "Dangerous"
              },
              {
                "description": "Master cylinder insecure",
                "category": "Major"
              },
              {
                "description": "Brake fluid: below minimum mark",
                "category": "Minor"
              },
              {
                "description": "Brake fluid: significantly below minimum mark",
                "category": "Major"
              },
              {
                "description": "Brake fluid: not visible",
                "category": "Dangerous"
              },
              {
                "description": "Master cylinder reservoir cap missing",
                "category": "Major"
              },
              {
                "description": "Brake fluid warning light illuminated or defective",
                "category": "Minor"
              },
              {
                "description": "Incorrect functioning of brake fluid level warning device",
                "category": "Minor"
              }
            ]
          },
          {
            "id": "1.1.11",
            "title": "Rigid brake pipes",
            "description": "If the metal brake pipes have surface dirt that needs to be removed before it's possible to assess their condition, you can lightly scrape the pipe with a specialist brake pipe corrosion tool or the corrosion assessment tool 'spade end'. It must be done with care so that any protective coating does not get damaged.\n\nChafing, corrosion or damage to a rigid brake pipe so that its wall thickness is reduced by 1/3 (approximately 0.25mm for typical hydraulic brake pipe) justifies rejection, although it's accepted that this is not easy to determine. If you are not sure whether the pipe is sufficiently deteriorated to justify rejection, you should give the benefit of the doubt.\n\nRepairs to the pressure lines of hydraulic brake systems are unacceptable unless suitable connectors are used. Compression joints of a type using separate ferrules are not suitable.\n\nUnacceptable repairs to brake lines should be failed using RfR 1.1.21 (d)",
            "defects": [
              {
                "description": "Brake pipe is at imminent risk of failure or fracture",
                "category": "Dangerous"
              },
              {
                "description": "Leaking brake pipe or connection on an air brake system",
                "category": "Major"
              },
              {
                "description": "Leaking brake pipe or connection on a hydraulic system",
                "category": "Dangerous"
              },
              {
                "description": "Brake pipe damaged or excessively corroded",
                "category": "Major"
              },
              {
                "description": "Brake pipe: inadequately clipped or supported",
                "category": "Minor"
              },
              {
                "description": "Brake pipe: likely to become detached or damaged",
                "category": "Major"
              }
            ]
          },
          {
            "id": "1.1.12",
            "title": "Flexible brake hoses",
            "description": "You should reject a hose for being excessively damaged or chafed only if it's severe enough to expose the reinforcement.",
            "defects": [
              {
                "description": "Brake hose damaged and likely to fail",
                "category": "Dangerous"
              },
              {
                "description": "Flexible brake hose: slightly damaged, chafed or twisted",
                "category": "Minor"
              },
              {
                "description": "Flexible brake hose: excessively damaged, deteriorated, chafed, twisted or stretched",
                "category": "Major"
              },
              {
                "description": "Brake hoses or connections leaking on air brake systems",
                "category": "Major"
              },
              {
                "description": "Brake hoses or connections leaking on hydraulic systems",
                "category": "Dangerous"
              },
              {
                "description": "Brake hose bulging under pressure",
                "category": "Major"
              },
              {
                "description": "Brake hose porous",
                "category": "Major"
              },
              {
                "description": "Brake hose ferrules: excessively corroded",
                "category": "Major"
              },
              {
                "description": "Brake hose ferrules: excessively corroded and likely to fail",
                "category": "Dangerous"
              }
            ]
          },
          {
            "id": "1.1.13",
            "title": "Brake linings and pads",
            "description": "Some brake pads have metal wear indicators so that when the pads become excessively worn the metal indicator touches the disc making a squealing sound. Other pads may have a cut, which if worn away indicates that the pad must be replaced.\n\nAn illuminated brake wear indicator is not a reason for failure.",
            "defects": [
              {
                "description": "Brake lining or pad: worn down to wear indicator",
                "category": "Major"
              },
              {
                "description": "Brake lining or pad: worn below 1.5mm",
                "category": "Dangerous"
              },
              {
                "description": "Brake lining or pad contaminated with oil, grease etc.",
                "category": "Major"
              },
              {
                "description": "Brake lining or pad missing or incorrectly mounted",
                "category": "Dangerous"
              }
            ]
          },
          {
            "id": "1.1.14",
            "title": "Brake discs and drums",
            "description": "A brake disc or drum must be significantly worn before you should reject it. Being worn below the manufacturer's recommended limits is not a reason in itself.",
            "defects": [
              {
                "description": "Brake disc or drum: significantly and obviously worn",
                "category": "Major"
              },
              {
                "description": "Brake disc or drum: insecure, fractured or otherwise likely to fail",
                "category": "Dangerous"
              },
              {
                "description": "Contaminated with oil, grease etc.",
                "category": "Major"
              },
              {
                "description": "Missing",
                "category": "Dangerous"
              },
              {
                "description": "Brake drum back plate insecure",
                "category": "Major"
              }
            ]
          },
          {
            "id": "1.1.15",
            "title": "Brake cables, rods, levers and linkages",
            "defects": [
              {
                "description": "Cable damaged or knotted",
                "category": "Major"
              },
              {
                "description": "Component excessively worn or corroded",
                "category": "Major"
              },
              {
                "description": "Cable, rod or joint insecure",
                "category": "Major"
              },
              {
                "description": "Cable guide defective affecting operation",
                "category": "Major"
              },
              {
                "description": "Restriction in free movement of the braking system",
                "category": "Major"
              },
              {
                "description": "Abnormal movement of levers indicating maladjustment or excessive wear",
                "category": "Major"
              }
            ]
          },
          {
            "id": "1.1.16",
            "title": "Brake actuators - including spring brakes, hydraulic cylinders and callipers",
            "defects": [
              {
                "description": "Actuator cracked or damaged and braking performance not affected",
                "category": "Major"
              },
              {
                "description": "Actuator cracked or damaged and braking performance affected",
                "category": "Dangerous"
              },
              {
                "description": "Actuator leaking and braking performance not affected",
                "category": "Major"
              },
              {
                "description": "Actuator leaking and braking performance affected",
                "category": "Dangerous"
              },
              {
                "description": "Actuator insecure or inadequately mounted and braking performance not affected",
                "category": "Major"
              },
              {
                "description": "Actuator insecure or inadequately mounted and braking performance affected",
                "category": "Dangerous"
              },
              {
                "description": "Actuator excessively corroded",
                "category": "Major"
              },
              {
                "description": "Actuator excessively corroded and likely to crack",
                "category": "Dangerous"
              },
              {
                "description": "Actuator has excessive travel of operating system indicating need for adjustment",
                "category": "Major"
              },
              {
                "description": "Actuator has no reserve travel and braking performance affected",
                "category": "Dangerous"
              }
            ]
          },
          {
            "id": "1.1.17",
            "title": "Load sensing valve",
            "defects": [
              {
                "description": "Load sensing valve linkage defective",
                "category": "Major"
              },
              {
                "description": "Load sensing valve linkage obviously incorrectly adjusted",
                "category": "Major"
              },
              {
                "description": "Load sensing valve seized or inoperative and ABS functioning",
                "category": "Major"
              },
              {
                "description": "Load sensing valve seized or inoperative and ABS not fitted or inoperative",
                "category": "Dangerous"
              },
              {
                "description": "Load sensing valve missing where fitted as standard",
                "category": "Dangerous"
              }
            ]
          },
          {
            "id": "1.1.18",
            "title": "Brake slack adjuster",
            "defects": [
              {
                "description": "Adjuster damaged, seized or having abnormal movement, excessive wear or incorrect adjustment",
                "category": "Major"
              },
              {
                "description": "Adjuster defective",
                "category": "Major"
              },
              {
                "description": "Incorrectly installed",
                "category": "Major"
              }
            ]
          },
          {
            "id": "1.1.19",
            "title": "Additional braking device (retarder), if fitted",
            "description": "An endurance braking system, such as an exhaust brake or electronic retarder is only likely to be fitted to some large motor caravans and category M2 and M3 vehicles.",
            "defects": [
              {
                "description": "Endurance braking system connectors or mountings insecure",
                "category": "Minor"
              },
              {
                "description": "Endurance braking system connectors or mountings insecure and functionality affected",
                "category": "Major"
              },
              {
                "description": "Endurance braking system obviously defective",
                "category": "Major"
              }
            ]
          },
          {
            "id": "1.1.20",
            "title": "Not in use"
          },
          {
            "id": "1.1.21",
            "title": "Complete braking system",
            "description": "You must check the strength and continuity of the vehicle's load bearing members and their supporting structure or panelling around any braking component mounting.\n\nCheck the presence and security of any retaining and locking devices.\n\nThe presence and effectiveness of some locking devices, such as locking fluid or 'nyloc' nuts, cannot be easily determined. If you are not certain that a locking device is missing or ineffective, you should give the benefit of the doubt.\n\nGuidance for assessing corrosion and use of the corrosion assessment tool can be found in Appendix A.",
            "defects": [
              {
                "description": "Other braking system (e.g. antifreeze pump, air dryer etc.) component damaged or corroded to the extent that the braking system is adversely affected",
                "category": "Major"
              },
              {
                "description": "Other braking system (e.g. antifreeze pump, air dryer etc.) component damaged or corroded leaking and system functionality adversely affected",
                "category": "Dangerous"
              },
              {
                "description": "Air or antifreeze leaking",
                "category": "Minor"
              },
              {
                "description": "Air or antifreeze leaking to the extent that braking performance is affected",
                "category": "Major"
              },
              {
                "description": "Any component insecure or inadequately mounted",
                "category": "Major"
              },
              {
                "description": "Braking system component modification unsafe",
                "category": "Major"
              },
              {
                "description": "Braking system component modification adversely affecting braking performance",
                "category": "Dangerous"
              },
              {
                "description": "The strength or continuity of the load bearing structure within 30cm of any braking system actuation component mounting (a prescribed area) is significantly reduced (see Appendix A)",
                "category": "Major"
              },
              {
                "description": "The strength or continuity of the load bearing structure within 30cm of any braking system actuation component mounting (a prescribed area) is so weakened that the functionality of the braking system is affected",
                "category": "Dangerous"
              },
              {
                "description": "Brake retaining or locking device ineffective or missing",
                "category": "Major"
              }
            ]
          }
        ]
      },
      {
        "id": "1.2",
        "title": "Service brake performance and efficiency",
        "items": [
          {
            "id": "1.2.1",
            "title": "Performance",
            "description": "You must ensure that the vehicle is in a safe condition for the test to be carried out.\n\nThe primary brake tester must be used unless the vehicle is unsuitable due to its drive configuration, transmission type or braking system. If this is the case, a full or partial decelerometer test may be appropriate. You should consider any additional information from the vehicle manufacturer.\n\nWhen conducting a test on a roller brake tester (RBT) where more than half of the wheels of a brake system lock the efficiency requirements for that system are considered to be met.\n\nAlternatively, the efficiency requirements are met if the front wheels lock on the service brake of an unladen Class 7 vehicle with at least a 100kg force at each rear wheel for a two-axle vehicle, or at least 50kg force at each rear wheel on a three-axle vehicle.\n\nWhen testing using an Automated RBT or a plate brake tester, the vehicle test weight for Classes 3 and 4 is the weight shown by the brake test equipment.\n\nFor non-automated roller brake testers the brake test weight must be obtained from a brake data chart or other reliable source.\n\nFor Class 7 use the DGW from the manufacture's plate or, the nominal DGW of 2,600kg if using a plate brake tester and the presented weight is less than 2,000kg.\n\nFor Class 5 use the lesser of the DGW or maximum authorised mass (MAM) from the manufacturer's plate. On vehicles where only the ULW is displayed, you must calculate the DGW by multiplying the number of passenger seats by 63.5kg and adding the ULW, for example: 52 seats × 63.5kg = 3302kg + 5,250kg ULW = 8552kg.\n\nVehicles of unknown test weight can be tested on either an RBT or plate brake tester (PBT). However, if the number of wheel locks are not achieved for any system on a non-ATL RBT, a decelerometer test must be used to establish the overall brake efficiency of the relevant system(s).\n\nCertain converted passenger vehicles, such as motor caravans and ambulances, may have a kerb weight greatly in excess of the base model weight displayed by the MOT testing service. In these circumstances, the vehicle should be treated as having an unknown test weight.\n\nAdditional braking devices, such as electronic retarders, should not be operated during the brake test.\n\nSome tricycles with two brake controls may have a linked braking system. The brake force used in the efficiency calculation is the total from all wheels when operated by that control only.",
            "defects": [
              {
                "description": "Braking effort: inadequate at a wheel",
                "category": "Major"
              },
              {
                "description": "Braking effort: not recording at a wheel",
                "category": "Dangerous"
              },
              {
                "description": "Brakes imbalance across an axle such that: the braking effort from any wheel is less than 70% of the maximum effort recorded from the other wheel on the same axle. Or in the case of testing on the road, the vehicle deviates excessively from a straight line",
                "category": "Major"
              },
              {
                "description": "Brakes imbalance across an axle such that: the braking effort from any wheel is less than 50% of the maximum effort recorded from the other wheel on a steered axle",
                "category": "Dangerous"
              },
              {
                "description": "A brake on any wheel grabbing severely",
                "category": "Major"
              },
              {
                "description": "Abnormal lag in brake operation on a wheel",
                "category": "Major"
              },
              {
                "description": "Excessive fluctuation in brake effort through each wheel revolution",
                "category": "Major"
              },
              {
                "description": "Significant brake effort recorded with no brake applied indicating a binding brake",
                "category": "Major"
              },
              {
                "description": "Brake performance unable to be tested",
                "category": "Major"
              }
            ],
            "subItems": [
              {
                "title": "Using a roller brake tester",
                "description": "Ensure that the vehicle, or system, under test is suitable for testing using a roller brake tester. If the vehicle or system is unsuitable, it should be tested with a decelerometer."
              },
              {
                "title": "ATL test procedure",
                "description": "Automated test lane (ATL) approved test stations should position the front wheels of the vehicle in the rollers of the brake tester and follow the sequence of instructions as displayed and prompted on screen. If a vehicle is ejected from the brake rollers, the required brake efforts may not be achieved. In such cases the test should be repeated in manual mode, running each roller individually."
              },
              {
                "title": "Non - ATL test procedure",
                "description": "You are permitted to use an alternative procedure to that specified below as long as all the testable elements are adequately covered.\n\n1. Position the wheels of the first axle to be tested in the brake rollers and then run both sets of rollers together in a forward direction until the vehicle is aligned. With the rollers still running, note whether a significant brake effort is recorded from any wheel without a brake being applied.\n\n2. Gradually apply the service brake and watch how the braking effort for each wheel increases. Stopping short of lock up or maximum effort, hold a steady pedal pressure and check there is no excessive brake effort fluctuation with each revolution of the road wheel.\n\n3. Gradually release the service brake and observe how the braking effort at each wheel reduces.\n\n4. Gradually depress the service brake again, this time until maximum effort is achieved, or until the wheel locks and slips on the rollers. Stop the rollers.\n\n5. Record the reading at which the maximum braking effort is achieved and whether brake \"lock-up\" occurs. Stop the rollers if they have not stopped automatically.\n\n6. Place the wheels of the next axle in the brake rollers and repeat the above procedure.\n\nWhen checking maximum effort, testers can elect to run the brake rollers individually or together, depending on the suitability of the RBT. However, if the rollers are run together and the vehicle fails to meet the minimum performance requirement, the test must be repeated running the rollers individually.\n\nIf both rollers are run together, it will almost certainly be necessary to chock the wheels that are not being tested."
              },
              {
                "title": "Using a plate brake tester",
                "description": "For vehicles other than Class 7, establish the actual presented weight of the vehicle.\n\nFor Class 7 vehicles, the brake efficiency will be calculated using one of the following:\n- the actual design gross weight (DGW) where the presented weight is at least 2,000kg (the DGW is obtained from the manufacturer's plate fitted to the vehicle)\n- a nominal DGW figure of 2,600kg if the presented weight is less than 2,000kg\n\nTo use a plate brake tester:\n\n1. Enter the appropriate data to conduct the test.\n\n2. For each check, drive the vehicle forwards at a steady speed of about 4mph up to the plate tester.\n\n3. On the first run, just before the wheels are on the plate high friction surfaces, apply a light constant pressure to the brake pedal. Do not stop on the tester. Take note of the way the brake efforts fluctuate.\n\n4. On the second run, as soon as the wheels are on the plate high friction braking surfaces, apply the service brake progressively until maximum effort is achieved.\n\n5. Take note of the way the brake efforts increase and the maximum values achieved.\n\nIf a vehicle fails any aspect of the plate brake test, the check should be repeated to confirm the result."
            }
            ]
          }
        ]
      }
    ]
  }

# Save to a file
def save_mot_manual():
    # Use the full data from paste.txt here
    # For brevity, I'm just using the partial data above
    
    filename = "mot_manual.json"
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(mot_manual_data, f, ensure_ascii=False, indent=2)
    
    print(f"Saved MOT manual data to {filename}")
    
    # Check the file size
    file_size = os.path.getsize(filename)
    print(f"File size: {file_size / 1024:.2f} KB")

if __name__ == "__main__":
    save_mot_manual()