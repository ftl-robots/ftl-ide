package ftlrobots.robot;

/*
============================================
FTL-GUIDE: Imports
This section essentially tells your robot the things it needs in order
to work.

For example, you will need to pull in things like SpeedControllers
or DigitalInputs. Any of these things will need to be import-ed.
============================================
*/
import edu.wpi.first.wpilibj.IterativeRobot;




public class Robot extends IterativeRobot {
	/*
    ============================================
    FTL-GUIDE: Member Declarations
    Use this section (that is outside of any other methods) to declare
    variables that are local to the robot. This includes things like
    speed controllers, or sensors, or other variables that might
    be of interest.
    ============================================
    */
    
    // === Declare your member variables BELOW this line



    // === Declare your member variables ABOVE this line

	@Override
	public void robotInit() {
        /*
        ============================================
        FTL-GUIDE: robotInit()
        This robotInit() function is called when the robot first
        starts up. This is a great place to put in any information
        or devices that the robot needs when it wakes up.

        Examples of this include initializing variables, or creating
        new speed controllers, etc.
        ============================================
        */

        // === Put code for robotInit BELOW this line



        // === Put code for robotInit ABOVE this line
	}

	@Override
	public void autonomousInit() {
		/*
        ============================================
        FTL-GUIDE: autonomousInit()
        This function gets called each time the robot enters
        the autonomous mode (from some other mode). This is a 
        great place to reset variables used in autonomous. 

        For example, if your autonomous routine is to drive
        straight for 5 seconds, this might be a good place to
        restart any timers, etc.
        ============================================
        */

        // === Put code for autonomousInit below this line



        // === Put code for autonomousInit ABOVE this line
	}

	@Override
	public void autonomousPeriodic() {
		/*
        ============================================
        FTL-GUIDE: autonomousPeriodic()
        This function gets called 20 times per second during 
        autonomous (hence, periodic). Every time this function
        is called, you can command your robot to do something.

        For example, if you're driving straight for 5 seconds,
        you might want to check the current time every time you 
        enter this function, and compare it against the time you
        started.
        ============================================
        */

        // === Put code for autonomousPeriodic below this line



        // === Put code for autonomousPeriodic ABOVE this line
	}

    @Override
    public void teleopInit() {
        /*
        ============================================
        FTL-GUIDE: teleopInit()
        This function gets called each time the robot enters
        the teleop mode (from some other mode). This is a 
        great place to reset variables used in teleop. 

        A good thing to put in here might be instructions
        to reset any variables or state that you may have
        set during autonomous mode.
        ============================================
        */

        // === Put code for teleopInit below this line



        // === Put code for teleopInit ABOVE this line
    }

	@Override
	public void teleopPeriodic() {
        /*
        ============================================
        FTL-GUIDE: teleopPeriodic()
        This function gets called 20 times per second during 
        teleop (hence, periodic). Every time this function
        is called, you can command your robot to do something.

        Similar to autonomousPeriodic, but during teleop mode.
        You can read Joystick inputs here and use them to drive
        or activate functions on your robot
        ============================================
        */

        // === Put code for teleopPeriodic below this line



        // === Put code for teleopPeriodic ABOVE this line
	}
}
